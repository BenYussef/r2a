<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SendMessage implements ShouldBroadcastNow
{
    use InteractsWithSockets, SerializesModels;
    public $data = ['asas'];


    /**
     * Create a new event instance.
     *
     * @return void
     */
    public $info;
    public function __construct($info)
    {
        $this->info = $info;
    }



    /**
     * Get the channels the event should broadcast on.
     *
     * @return \Illuminate\Broadcasting\Channel|array
     */
    public function broadcastOn()
    {
        return new Channel('user-channel');
    }

    public function broadcastAs()
    {
        return 'UserEvent';
    }

    public function broadcastWith()
    {
        return ['title'=>'Vous avez demander la liste des utilisateurs',
            'data'=>$this->info];
    }
}
