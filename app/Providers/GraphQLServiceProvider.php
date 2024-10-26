<?php

namespace App\Providers;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\ServiceProvider;
use Rebing\GraphQL\Support\Facades\GraphQL;

class GraphQLServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     *
     * @return void
     */
    public function register()
    {
        //
    }

    /**
     * Bootstrap services.
     *
     * @return void
     */
    public function boot()
    {
        $this->loading();
    }

    /**
     * Permet d'enrgistrer automatiquement les schemas et types GraphQL
     *
     * @return void
     */
    protected function loadingAllTypes($classes)
    {
        GraphQL::addTypes($classes);
    }

    protected function loadingAllQuerys($classes)
    {
        GraphQL::addSchema(
            config('graphql.default_schema'),
            [
                'query' => array_values(
                    $classes
                ),
            ]
        );
    }

    protected function getAllClassesOf($workDirectory, $directory)
    {
        $classPaths = glob(app_path() . "/{$workDirectory}/{$directory}/*.php");
        $classes = array();
        $namespace = "App\\{$workDirectory}\\{$directory}\\";
        foreach ($classPaths as $classPath)
        {
            $segments = explode('/', $classPath);
            $classes[] = "\\". str_replace('.php', '', ($namespace . end($segments)));
        }
        return $classes;
    }

    /**
     * Permet d'enrgistrer automatiquement les schemas et types GraphQL
     *
     * @return void
     */
    protected function loading()
    {
        $workDirectory = "GraphQL";
        $directories = ["Type", "Query"];
        foreach ($directories as $directory)
        {
            if (config('app.env') === 'production')
            {
                $classes = Cache::get("{$workDirectory}{$directory}s", $this->getAllClassesOf($workDirectory, $directory));
            }
            else
            {
                $classes = $this->getAllClassesOf($workDirectory, $directory);
            }
            $functionName = "loadingAll{$directory}s";
            $this->$functionName($classes);
        }
    }
}
