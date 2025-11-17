let nextId = 1;

/**
 * Simple countdown timer that emits updates once per second.
 */
export class Timer {
    constructor(minutes, seconds, onTick, onFinish) {
        this.id = nextId++;
        this.minutes = minutes;
        this.seconds = seconds;
        this.onTick = onTick;
        this.onFinish = onFinish;
        this.interval = null;
        this.emitTick();
    }

    emitTick() {
        if (this.onTick) {
            this.onTick(this.minutes, this.seconds, this.getRemainingSeconds());
        }
    }

    start() {
        if (this.interval) {
            return;
        }

        this.interval = setInterval(() => this.tick(), 1000);
    }

    pause() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    reset(minutes, seconds = 0) {
        this.pause();
        this.minutes = minutes;
        this.seconds = seconds;
        this.emitTick();
    }

    tick() {
        if (this.seconds > 0) {
            this.seconds -= 1;
        }
        else if (this.minutes > 0) {
            this.minutes -= 1;
            this.seconds = 59;
        }
        else {
            this.pause();
            if (this.onFinish) {
                this.onFinish();
            }
            return;
        }

        this.emitTick();
    }

    getRemainingSeconds() {
        return this.minutes * 60 + this.seconds;
    }
}

export function formatTime(minutes, seconds) {
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
