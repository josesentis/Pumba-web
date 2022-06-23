import { GetBy, C } from '../core/Element';
import { WinMessage } from '../windows/Message';
import FormSender from './FormSender';

const EMAIL_FILTER =
  /^([a-zA-Z0-9_\.\ñ\Ñ\-])+\@(([a-zA-Z0-9\-\ñ\Ñ])+\.)+([a-zA-Z0-9]{2,4})+$/;

const TELF_FILTER = /^([0-9]+){9}$/;

export default class Forms {
  static init() {
    C.forEach(".__form", (e) => { new FormValidator(e); })
  }
}

export class FormValidator {
  _form;
  _fields = [];
  _dataSend = {};
  _files = [];
  callback;

  constructor(__form, __callback) {
    this.callback = __callback !== undefined ? __callback : this.defaultCb;
    this._form = __form;
    this._form.classList.remove('__form');
    this._form.addEventListener('submit', (e) => {
      this.prepareSubmit(e);
    });

    this._input = (e) => {
      this.validate(e.target);
    };
    this._focus = (e) => {
      this.focus(e.target);
    };
    this._blur = (e) => {
      this.validate(e.target);
      this.focus(e.target, false);
    };

    const items = [
      ...GetBy.selector('input', this._form),
      ...GetBy.selector('select', this._form),
      ...GetBy.selector('textarea', this._form)
    ];
    C.forEach(items, (e) => {
      this._fields.push(e);
      this.setupValidation(e);
    });
  }

  setupValidation(__item) {
    __item.addEventListener('change', this._input);
    __item.addEventListener('focus', this._focus);
    __item.addEventListener('blur', this._blur);
  }

  focus(__input, focus = true) {
    __input.parentNode.classList[focus ? 'add' : 'remove']('--focus');
  }

  validate(__input) {
    if (!__input) return false;
    if (__input.disabled) return true;

    let valid = true;

    if (
      __input.dataset.formRequired !== undefined &&
      __input.value.split(' ').join('') === ''
    ) {
      valid = false;
    }

    if (
      __input.dataset.formEmail !== undefined &&
      !EMAIL_FILTER.test(__input.value)
    ) {
      valid = false;
    }

    if (
      __input.dataset.formTel !== undefined &&
      !TELF_FILTER.test(__input.value)
    ) {
      valid = false;
    }

    if (__input.dataset.formCheckbox !== undefined && !__input.checked) {
      valid = false;
    }

    if (__input.dataset.formRadio !== undefined && !__input.checked) {
      valid = false;
    }

    if (__input.dataset.formFile !== undefined) {
      if (__input.files.length) __input.nextElementSibling.innerHTML = __input.files[0].name;
      else valid = false;
    }

    if (valid) {
      __input.parentNode.classList.remove('--error');
      __input.parentNode.classList.add('--success');
    } else {
      __input.parentNode.classList.add('--error');
      __input.parentNode.classList.remove('--success');
    }

    return valid;
  }

  check() {
    let valid = true;

    C.forEach(this._fields, (item) => {
      if (!this.validate(item)) {
        valid = false;
      } else {
        if (item.dataset.formFile !== undefined) {
          this._files.push({
            name: item.getAttribute('name'),
            value: item.files[0]
          });
        } else {
          this._dataSend[item.getAttribute('name')] = item.value;
        }
      }
    });

    return valid;
  }

  prepareSubmit(e) {
    e.preventDefault();

    if (this.check()) {
      this.parseToSend();
    }
  }

  parseToSend() {
    this._dataSend['token'] = this._form.getAttribute('data-token');

    if (this._form.getAttribute('data-to') !== undefined) {
      this._dataSend['to'] = this._form.getAttribute('data-to');
    }

    FormSender.send(this, this._dataSend, this._form, this._files);
  }

  reset() {
    this._dataSend = {};

    C.forEach(this._fields, (item) => {
      item.value = '';
      item.checked = false;
      item.parentNode.classList.remove('--error');
      item.parentNode.classList.add('--success');
    });
    this._files = [];

    C.forEach(GetBy.class('__filename', this._form), item => {
      item.innerHTML = '';
    });
  }

  dispose() {
    C.forEach(this._fields, (item) => {
      item.removeEventListener('change', this._input);
      item.removeEventListener('focus', this._focus);
      item.removeEventListener('blur', this._blur);
    });
  }

  defaultCb = status => {
    if (status === 'ok') {
      WinMessage.success(this._form.dataset.mssgOk);
    } else {
      WinMessage.error(this._form.dataset.mssgNok);
    }
  };
}
