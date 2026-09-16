<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('crms:backup')->dailyAt('03:00');
