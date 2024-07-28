import { notify } from './notify';

import '../css/common.css';

const formRef = document.querySelector('.form');

formRef.addEventListener('submit', e => {
  e.preventDefault();
  const { delay, state } = e.target.elements;
  const delayValue = delay.value.trim();
  const stateValue = state.value;

  if (!delayValue.trim() || !stateValue) {
    notify.error('Fill please all fields');
    return;
  }

  const normalizedDelayValue = Number(delayValue);
  if (Number.isNaN(normalizedDelayValue)) {
    notify.error(`Invalid delay: ${delayValue}`);
    return;
  }

  if (!Number.isInteger(normalizedDelayValue)) {
    notify.error('Delay must be integer');
    return;
  }

  if (stateValue !== 'fulfilled' && stateValue !== 'rejected') {
    notify.error(`Invalid state: ${stateValue}`);
    return;
  }

  createPromise(stateValue, normalizedDelayValue)
    .then(notify.success)
    .catch(notify.error);
});

function createPromise(state, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (state === 'fulfilled') {
        resolve(`✅ Fulfilled promise in ${delay}ms`);
      } else {
        reject(`❌ Rejected promise in ${delay}ms`);
      }
    }, delay);
  });
}
