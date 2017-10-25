load('api_config.js');
load('api_gpio.js');
load('api_mqtt.js');
load('api_sys.js');
load('api_timer.js');
load('api_aws.js');
load('api_uart.js');
load('bulb.js');

let getInfo = function() {
    return JSON.stringify({total_ram: Sys.total_ram(), free_ram: Sys.free_ram()});
};

// Publish to MQTT topic on a button press. Button is wired to GPIO pin 0
GPIO.set_button_handler(0, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 2000, function() {
    let topic = '/devices/' + Cfg.get('device.id') + '/events';
    let message = getInfo();
    let ok = MQTT.pub(topic, message, 1);
    print('Published:', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);
}, null);

let bulb = Bulb.create();
let state = { on: false, counter: 0 };

AWS.Shadow.setStateHandler(function(data, event, reported, desired) {
    if (event === AWS.Shadow.CONNECTED) {
        AWS.Shadow.update(0, {reported: state});
    } else if (event === AWS.Shadow.UPDATE_DELTA) {
        for (let key in state) {
            if (desired[key] !== undefined) state[key] = desired[key];
            if (state.on === true) {
                if (bulb.get() !== Bulb.ON) {
                    bulb.set(Bulb.ON);
                }
            } else if (state.on === false) {
                if (bulb.get() !== Bulb.OFF) {
                    bulb.set(Bulb.OFF);
                }
            }
        }
        AWS.Shadow.update(0, {reported: state});
    }
    print(JSON.stringify(reported), JSON.stringify(desired));
}, null);

let button = Cfg.get('pin.button');
GPIO.set_button_handler(button, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function() {
    state.counter = state.counter + 1;
    let on = bulb.get();
    if (on === Bulb.ON) {
        bulb.set(Bulb.OFF);
        state.on = false;
    } else if (on === Bulb.OFF) {
        bulb.set(Bulb.ON);
        state.on = true;
    }
    AWS.Shadow.update(0, {desired: state});
}, null);

