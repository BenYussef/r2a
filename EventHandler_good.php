<?php

namespace Sentry\Laravel;

use Exception;
use Illuminate\Auth\Events\Authenticated;
use Illuminate\Console\Events\CommandFinished;
use Illuminate\Console\Events\CommandStarting;
use Illuminate\Contracts\Events\Dispatcher;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Log\Events\MessageLogged;
use Illuminate\Queue\Events\JobExceptionOccurred;
use Illuminate\Queue\Events\JobProcessed;
use Illuminate\Queue\Events\JobProcessing;
use Illuminate\Queue\Events\WorkerStopping;
use Illuminate\Routing\Events\RouteMatched;
use Illuminate\Routing\Route;
use RuntimeException;
use Sentry\Breadcrumb;
use Sentry\SentrySdk;
use Sentry\State\Scope;

class EventHandler
{
    /**
     * Map event handlers to events.
     *
     * @var array
     */
    protected static $eventHandlerMap = [
        'router.matched' => 'routerMatched',                         // Until Laravel 5.1
        'Illuminate\Routing\Events\RouteMatched' => 'routeMatched',  // Since Laravel 5.2

        'illuminate.query' => 'query',                                 // Until Laravel 5.1
        'Illuminate\Database\Events\QueryExecuted' => 'queryExecuted', // Since Laravel 5.2

        'illuminate.log' => 'log',                                // Until Laravel 5.3
        'Illuminate\Log\Events\MessageLogged' => 'messageLogged', // Since Laravel 5.4

        'Illuminate\Console\Events\CommandStarting' => 'commandStarting', // Since Laravel 5.5
        'Illuminate\Console\Events\CommandFinished' => 'commandFinished', // Since Laravel 5.5
    ];

    /**
     * Map authentication event handlers to events.
     *
     * @var array
     */
    protected static $authEventHandlerMap = [
        'Illuminate\Auth\Events\Authenticated' => 'authenticated', // Since Laravel 5.3
    ];

    /**
     * Map queue event handlers to events.
     *
     * @var array
     */
    protected static $queueEventHandlerMap = [
        'Illuminate\Queue\Events\JobProcessing' => 'queueJobProcessing', // Since Laravel 5.2
        'Illuminate\Queue\Events\JobProcessed' => 'queueJobProcessed', // Since Laravel 5.2
        'Illuminate\Queue\Events\JobExceptionOccurred' => 'queueJobExceptionOccurred', // Since Laravel 5.2
        'Illuminate\Queue\Events\WorkerStopping' => 'queueWorkerStopping', // Since Laravel 5.2
    ];

    /**
     * The Laravel event dispatcher.
     *
     * @var \Illuminate\Contracts\Events\Dispatcher
     */
    private $events;

    /**
     * Indicates if we should we add SQL queries to the breadcrumbs.
     *
     * @var bool
     */
    private $recordSqlQueries;

    /**
     * Indicates if we should we add query bindings to the breadcrumbs.
     *
     * @var bool
     */
    private $recordSqlBindings;

    /**
     * Indicates if we should we add Laravel logs to the breadcrumbs.
     *
     * @var bool
     */
    private $recordLaravelLogs;

    /**
     * Indicates if we should we add queue info to the breadcrumbs.
     *
     * @var bool
     */
    private $recordQueueInfo;

    /**
     * EventHandler constructor.
     *
     * @param \Illuminate\Contracts\Events\Dispatcher $events
     * @param array                                   $config
     */
    public function __construct(Dispatcher $events, array $config)
    {
        $this->events = $events;
        $this->recordSqlQueries = ($config['breadcrumbs.sql_queries'] ?? $config['breadcrumbs']['sql_queries'] ?? true) === true;
        $this->recordSqlBindings = ($config['breadcrumbs.sql_bindings'] ?? $config['breadcrumbs']['sql_bindings'] ?? false) === true;
        $this->recordLaravelLogs = ($config['breadcrumbs.logs'] ?? $config['breadcrumbs']['logs'] ?? true) === true;
        $this->recordQueueInfo = ($config['breadcrumbs.queue_info'] ?? $config['breadcrumbs']['queue_info'] ?? true) === true;
    }

    /**
     * Attach all event handlers.
     */
    public function subscribe()
    {
        foreach (static::$eventHandlerMap as $eventName => $handler) {
            $this->events->listen($eventName, [$this, $handler]);
        }
    }

    /**
     * Attach all authentication event handlers.
     */
    public function subscribeAuthEvents()
    {
        foreach (static::$authEventHandlerMap as $eventName => $handler) {
            $this->events->listen($eventName, [$this, $handler]);
        }
    }

    /**
     * Attach all queue event handlers.
     */
    public function subscribeQueueEvents()
    {
        foreach (static::$queueEventHandlerMap as $eventName => $handler) {
            $this->events->listen($eventName, [$this, $handler]);
        }
    }

    /**
     * Pass through the event and capture any errors.
     *
     * @param string $method
     * @param array  $arguments
     */
    public function __call($method, $arguments)
    {
        /*if (!method_exists($this, $method . 'handler')) {
            throw new RuntimeException('Missing event handler:' . $method . 'handler');
        }*/

        try {
            if (method_exists($this, $method . 'handler'))
            {
                call_user_func_array([$this, $method . 'handler'], $arguments);
            }
        } catch (Exception $exception) {
            // Ignore
        }
    }

    /**
     * Until Laravel 5.1
     *
     * @param Route $route
     */
    protected function routerMatchedHandler(Route $route)
    {
        if ($route->getName()) {
            // someaction (route name/alias)
            $routeName = $route->getName();
        } elseif ($route->getActionName()) {
            // SomeController@someAction (controller action)
            $routeName = $route->getActionName();
        }
        if (empty($routeName) || $routeName === 'Closure') {
            // /someaction // Fallback to the url
            $routeName = $route->uri();
        }

        Integration::addBreadcrumb(new Breadcrumb(
            Breadcrumb::LEVEL_INFO,
            Breadcrumb::TYPE_NAVIGATION,
            'route',
            $routeName
        ));
        Integration::setTransaction($routeName);
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Routing\Events\RouteMatched $match
     */
    protected function routeMatchedHandler(RouteMatched $match)
    {
        $this->routerMatchedHandler($match->route);
    }

    /**
     * Until Laravel 5.1
     *
     * @param string $query
     * @param array  $bindings
     * @param int    $time
     * @param string $connectionName
     */
    protected function queryHandler($query, $bindings, $time, $connectionName)
    {
        if (!$this->recordSqlQueries) {
            return;
        }

        $this->addQueryBreadcrumb($query, $bindings, $time, $connectionName);
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Database\Events\QueryExecuted $query
     */
    protected function queryExecutedHandler(QueryExecuted $query)
    {
        if (!$this->recordSqlQueries) {
            return;
        }

        $this->addQueryBreadcrumb($query->sql, $query->bindings, $query->time, $query->connectionName);
    }

    /**
     * Helper to add an query breadcrumb.
     *
     * @param string     $query
     * @param array      $bindings
     * @param float|null $time
     * @param string     $connectionName
     */
    private function addQueryBreadcrumb($query, $bindings, $time, $connectionName)
    {
        $data = ['connectionName' => $connectionName];

        if ($time !== null) {
            $data['executionTimeMs'] = $time;
        }

        if ($this->recordSqlBindings) {
            $data['bindings'] = $bindings;
        }

        Integration::addBreadcrumb(new Breadcrumb(
            Breadcrumb::LEVEL_INFO,
            Breadcrumb::TYPE_DEFAULT,
            'sql.query',
            $query,
            $data
        ));
    }

    /**
     * Until Laravel 5.3
     *
     * @param string     $level
     * @param string     $message
     * @param array|null $context
     */
    protected function logHandler($level, $message, $context)
    {
        $this->addLogBreadcrumb($level, $message, is_array($context) ? $context : []);
    }

    /**
     * Since Laravel 5.4
     *
     * @param \Illuminate\Log\Events\MessageLogged $logEntry
     */
    protected function messageLoggedHandler(MessageLogged $logEntry)
    {
        $this->addLogBreadcrumb($logEntry->level, $logEntry->message, $logEntry->context);
    }

    /**
     * Helper to add an log breadcrumb.
     *
     * @param string $level   Log level. May be any standard.
     * @param string $message Log messsage.
     * @param array  $context Log context.
     */
    private function addLogBreadcrumb(string $level, string $message, array $context = []): void
    {
        if (!$this->recordLaravelLogs) {
            return;
        }

        Integration::addBreadcrumb(new Breadcrumb(
            $this->logLevelToBreadcrumbLevel($level),
            Breadcrumb::TYPE_DEFAULT,
            'log.' . $level,
            $message,
            empty($context) ? [] : ['params' => $context]
        ));
    }

    /**
     * Translates common log levels to Sentry breadcrumb levels.
     *
     * @param string $level Log level. Maybe any standard.
     *
     * @return string Breadcrumb level.
     */
    protected function logLevelToBreadcrumbLevel(string $level): string
    {
        switch (strtolower($level)) {
            case 'debug':
                return Breadcrumb::LEVEL_DEBUG;
            case 'warning':
                return Breadcrumb::LEVEL_WARNING;
            case 'error':
                return Breadcrumb::LEVEL_ERROR;
            case 'critical':
            case 'alert':
            case 'emergency':
                return Breadcrumb::LEVEL_FATAL;
            case 'info':
            case 'notice':
            default:
                return Breadcrumb::LEVEL_INFO;
        }
    }

    /**
     * Since Laravel 5.3
     *
     * @param \Illuminate\Auth\Events\Authenticated $event
     */
    protected function authenticatedHandler(Authenticated $event)
    {
        Integration::configureScope(static function (Scope $scope) use ($event): void {
            $scope->setUser([
                'id' => $event->user->getAuthIdentifier(),
            ], true);
        });
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Queue\Events\JobProcessing $event
     */
    protected function queueJobProcessingHandler(JobProcessing $event)
    {
        $this->beforeQueuedJob();

        if (!$this->recordQueueInfo) {
            return;
        }

        $job = [
            'job' => $event->job->getName(),
            'queue' => $event->job->getQueue(),
            'attempts' => $event->job->attempts(),
            'connection' => $event->connectionName,
        ];

        // Resolve name exists only from Laravel 5.3+
        if (method_exists($event->job, 'resolveName')) {
            $job['resolved'] = $event->job->resolveName();
        }

        Integration::addBreadcrumb(new Breadcrumb(
            Breadcrumb::LEVEL_INFO,
            Breadcrumb::TYPE_DEFAULT,
            'queue.job',
            'Processing queue job',
            $job
        ));
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Queue\Events\JobProcessing $event
     */
    protected function queueJobExceptionOccurred(JobExceptionOccurred $event)
    {
        $this->afterQueuedJob();
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Queue\Events\JobProcessing $event
     */
    protected function queueJobProcessed(JobProcessed $event)
    {
        $this->afterQueuedJob();
    }

    /**
     * Since Laravel 5.2
     *
     * @param \Illuminate\Queue\Events\JobProcessing $event
     */
    protected function queueWorkerStopping(WorkerStopping $event)
    {
        // Flush any and all events that were possibly generated by queue jobs
        Integration::flushEvents();
    }

    /**
     * Since Laravel 5.5
     *
     * @param \Illuminate\Console\Events\CommandStarting $event
     */
    protected function commandStartingHandler(CommandStarting $event)
    {
        if ($event->command) {
            Integration::configureScope(static function (Scope $scope) use ($event): void {
                $scope->setTag('command', $event->command);
            });

            if (!$this->recordQueueInfo) {
                return;
            }

            Integration::addBreadcrumb(new Breadcrumb(
                Breadcrumb::LEVEL_INFO,
                Breadcrumb::TYPE_DEFAULT,
                'artisan.command',
                'Starting Artisan command: ' . $event->command,
                method_exists($event->input, '__toString') ? [
                    'input' => (string)$event->input,
                ] : []
            ));
        }
    }

    /**
     * Since Laravel 5.5
     *
     * @param \Illuminate\Console\Events\CommandFinished $event
     */
    protected function commandFinishedHandler(CommandFinished $event)
    {
        Integration::addBreadcrumb(new Breadcrumb(
            Breadcrumb::LEVEL_INFO,
            Breadcrumb::TYPE_DEFAULT,
            'artisan.command',
            'Finished Artisan command: ' . $event->command,
            array_merge([
                'exit' => $event->exitCode,
            ], method_exists($event->input, '__toString') ? [
                'input' => (string)$event->input,
            ] : [])
        ));

        Integration::configureScope(static function (Scope $scope) use ($event): void {
            $scope->setTag('command', '');
        });

        // Flush any and all events that were possibly generated by the command
        Integration::flushEvents();
    }

    private function beforeQueuedJob()
    {
        // When a job starts, we want to push a new scope
        SentrySdk::getCurrentHub()->pushScope();
    }

    private function afterQueuedJob()
    {
        // Flush any and all events that were possibly generated by queue jobs
        Integration::flushEvents();

        // We have added a scope when the job started processing
        SentrySdk::getCurrentHub()->popScope();
    }
}
