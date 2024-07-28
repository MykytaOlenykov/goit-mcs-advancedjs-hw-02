import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

export const notify = {
  success(message) {
    iziToast.success({
      position: 'topRight',
      message,
    });
  },
  error(message) {
    iziToast.error({
      position: 'topRight',
      message,
    });
  },
};
