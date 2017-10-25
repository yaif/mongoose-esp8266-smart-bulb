load("api_gpio.js");
load("api_config.js");
load("api_sys.js");
load("api_neopixel.js");

let Bulb = {
    ON: 0,
    OFF: 1,

    create: function() {
        let pin = Cfg.get('pin.bulb');
        GPIO.set_mode(pin, GPIO.MODE_OUTPUT);
        GPIO.write(pin, 0);  // Keep in reset.
        let numPixels = 4;
        let colorOrder = NeoPixel.RGB;
        let strip = NeoPixel.create(pin, numPixels, colorOrder);
        let s = Object.create({
            pin: pin,
            strip: strip,
            set: Bulb.set,
            get: Bulb.get,
            state: Bulb.OFF,
        });
        s.set(Bulb.OFF);
        return s;
    },

    set: function(onoff) {
        if (onoff === Bulb.ON) {
            this.state = Bulb.ON;
            this.strip.setPixel(0, 10, 0, 0);
            this.strip.setPixel(1, 0, 10, 0);
            this.strip.setPixel(2, 0, 0, 10);
            this.strip.setPixel(3, 10, 10, 10);
        } else if (onoff === Bulb.OFF) {
            this.state = Bulb.OFF;
            this.strip.setPixel(0, 0, 0, 0);
            this.strip.setPixel(1, 0, 0, 0);
            this.strip.setPixel(2, 0, 0, 0);
            this.strip.setPixel(3, 0, 0, 0);
        }
        Sys.usleep(60);
        this.strip.show();
    },

    get: function() {
        return this.state;
    }

};
