// import { GetBy } from '../core/Element';

export default class FormSender {
  static async send(__formValidator, __data, __form, __files = null) {
    // let btn = GetBy.class('__submit', __form)[0];

    // if (typeof Loading !== 'undefined') {
    //   Loading.start();
    // }

    // const btn_loading =
    //   btn.getAttribute('data-text-sending') === undefined
    //     ? null
    //     : btn.getAttribute('data-text-sending');

    // if (btn_loading) {
    //   btn.classList.add('__loading');
    //   btn.textContent = btn.getAttribute('data-text-sending');
    // }

    let data = {};

    if (__form.getAttribute('data-type') === 'newsletter-subscriptions') {
      data = {
        data: {
          type: __form.attr('data-type'),
          attributes: __data
        }
      };
    } else if (__form.getAttribute('data-type') === 'mailforms') {
      delete __data.to;
      data = Object.keys(__data)
        .map((key) => {
          return (
            encodeURIComponent(key) + '=' + encodeURIComponent(__data[key])
          );
        })
        .join('&');

      const files = [];
      __files.map((file) => {
        files.push(FormSender.sendFile(file));
      });

      await Promise.all(files)
        .then((res) => {
          res.map((r) => {
            data += '&' + encodeURIComponent(r.name) + '=' + encodeURIComponent(r.url);
          });
        })
        .catch((err) => {
          console.log('Error', err);
        });
    } else {
      data = {
        data: {
          subject: __form.getAttribute('data-subject'),
          attributes: __data,
          attachments: __files
        }
      };
    }

    let xhr = new XMLHttpRequest();
    xhr.open('POST', __form.getAttribute('data-href'));
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.onload = (e) => {
      // if (typeof Loading !== 'undefined') {
      //   Loading.stop();
      // }

      const status = xhr.status === 204 ? 'ok' : 'ko';

      __formValidator.callback(status);
    };
    xhr.send(data);
  }

  static async sendFile(file) {
    return new Promise((resolve, reject) => {
      const fileSender = new XMLHttpRequest();
      fileSender.open('POST', '/.netlify/functions/file-uploader');
      fileSender.onload = () => {
        if (fileSender.status === 200) {
          resolve(JSON.parse(fileSender.response));
        } else {
          reject(fileSender.response);
        }
      };

      const formData = new FormData();
      formData.append('form-name', 'Contact');
      formData.append(file.name, file.value);

      fileSender.send(formData);
    });
  }
}
