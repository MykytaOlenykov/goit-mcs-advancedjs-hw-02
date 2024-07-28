import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

import { notify } from './notify';

import '../css/common.css';

class Element {
  constructor(selector) {
    this.ref = document.querySelector(selector);
  }
}

class ElementController extends Element {
  isDisabled() {
    return this.ref.hasAttribute('disabled');
  }

  disable() {
    this.ref.setAttribute('disabled', '');
  }

  enable() {
    this.ref.removeAttribute('disabled');
  }
}

class ButtonController extends ElementController {
  #onClickCallback = null;

  onClick(callback) {
    if (this.#onClickCallback) {
      this.ref.removeEventListener('click', this.#onClickCallback);
    }

    this.#onClickCallback = e => {
      if (!this.isDisabled()) callback(e);
    };

    this.ref.addEventListener('click', this.#onClickCallback);
  }
}

class TimeViewElement extends Element {
  update(value) {
    this.ref.textContent = value;
  }
}

class TimerView {
  #daysViewElement = null;
  #hoursViewElement = null;
  #minutesViewElement = null;
  #secondsViewElement = null;

  constructor({
    daysViewElement = null,
    hoursViewElement = null,
    minutesViewElement = null,
    secondsViewElement = null,
  }) {
    this.#daysViewElement = daysViewElement;
    this.#hoursViewElement = hoursViewElement;
    this.#minutesViewElement = minutesViewElement;
    this.#secondsViewElement = secondsViewElement;
  }

  refresh(timeMs) {
    const { days, hours, minutes, seconds } = this.convertMs(timeMs);
    this.#daysViewElement?.update(this.addLeadingZero(days));
    this.#hoursViewElement?.update(this.addLeadingZero(hours));
    this.#minutesViewElement?.update(this.addLeadingZero(minutes));
    this.#secondsViewElement?.update(this.addLeadingZero(seconds));
  }

  convertMs(ms) {
    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const days = Math.floor(ms / day);
    const hours = Math.floor((ms % day) / hour);
    const minutes = Math.floor(((ms % day) % hour) / minute);
    const seconds = Math.floor((((ms % day) % hour) % minute) / second);

    return { days, hours, minutes, seconds };
  }

  addLeadingZero(value) {
    return String(value).padStart(2, '0');
  }
}

class Timer {
  #selectedDatetime = new Date();
  #intervalId = null;
  #onStopCallback = null;
  #view;

  constructor(view) {
    this.#view = view;
  }

  get selectedDatetime() {
    return this.#selectedDatetime;
  }

  set selectedDatetime(newSelectedDatetime) {
    const isValidSelectedDatetime = this.validateDatetime(newSelectedDatetime);
    if (!isValidSelectedDatetime) throw new Error('Invalid selectedDatetime');

    if (this.#intervalId === null) {
      this.#selectedDatetime = newSelectedDatetime;
    } else {
      const message = 'Timer started.';
      notify.error(message);
      throw new Error(message);
    }
  }

  onStop(callback) {
    this.#onStopCallback = callback;
  }

  start() {
    if (!this.validateDatetime(this.#selectedDatetime)) {
      return false;
    }

    const datetimeDelta = this.calculateDeltaDatetime();
    this.#view.refresh(datetimeDelta);

    this.#intervalId = setInterval(() => {
      const datetimeDelta = this.calculateDeltaDatetime();
      this.#view.refresh(datetimeDelta);

      if (datetimeDelta <= 0) {
        this.stop();
        notify.success('The timer has finished its work.');
        return;
      }
    }, 1000);

    return true;
  }

  stop() {
    clearInterval(this.#intervalId);
    this.#intervalId = null;
    this.#view.refresh(0);
    this.#onStopCallback?.();
  }

  validateDatetime(datetime) {
    const isValidDatetime = datetime > new Date();
    if (!isValidDatetime) {
      notify.error('Please choose a date in the future');
    }
    return isValidDatetime;
  }

  calculateDeltaDatetime() {
    const datetimeDelta = this.#selectedDatetime - new Date();
    return datetimeDelta < 0 ? 0 : datetimeDelta;
  }
}

const datetimePickerElement = new ElementController('input#datetime-picker');
const buttonElement = new ButtonController('button[data-start]');
const timerView = new TimerView({
  daysViewElement: new TimeViewElement('[data-days]'),
  hoursViewElement: new TimeViewElement('[data-hours]'),
  minutesViewElement: new TimeViewElement('[data-minutes]'),
  secondsViewElement: new TimeViewElement('[data-seconds]'),
});
const timer = new Timer(timerView);

buttonElement.disable();
buttonElement.onClick(handleStartTimer);

timer.onStop(handleStopTimer);

const options = {
  enableTime: true,
  time_24hr: true,
  defaultDate: timer.selectedDatetime,
  minuteIncrement: 1,
  onClose(selectedDates) {
    handleChangeDatetime(selectedDates[0]);
  },
};

flatpickr(datetimePickerElement.ref, options);

function handleChangeDatetime(selectedDatetime) {
  try {
    timer.selectedDatetime = selectedDatetime;
    buttonElement.enable();
  } catch (error) {
    buttonElement.disable();
  }
}

function handleStartTimer() {
  buttonElement.disable();
  const started = timer.start();
  started && datetimePickerElement.disable();
}

function handleStopTimer() {
  datetimePickerElement.enable();
}
