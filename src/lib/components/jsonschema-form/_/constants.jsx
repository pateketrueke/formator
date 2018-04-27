export const RE_PLACEHOLDER = /\{(?:(@?[\w.]+)(?::([\w*,.]+))?([|?!])?(.*?))\}/;
export const RE_DATA_BASE64 = /^data:(.+?);base64,/;
export const RE_NUM = /^\d+/;
export const RE_SPACE = /\s+/;
export const RE_NWORD = /\W+/g;

export const HEADERS = {
  'Accept': 'application/json',
  'Content-Type': 'application/json',
};

export const LAYERS = [];

export const TYPES = {
  debug(data, values, parentNode) {
    return <pre>{JSON.stringify({ data, values }, null, 2)}</pre>;
  },
  embed(data, values, parentNode) {
    let fileName;

    if (!values.length) {
      return 'NOIMG';
    }

    if (values[0].indexOf('data:') > -1) {
      fileName = values[0].match(RE_DATA_BASE64)[1].split(';')[1].split('name=')[1];
    } else {
      fileName = values[0];
    }

    if (values[1]) {
      fileName = values[1];
    }

    return <a
      href={values[0]}
      target="_blank"
      onClick={e => {
        if (e.metaKey || e.ctrlKey) {
          return;
        }

        e.preventDefault();

        const target = document.createElement('div');

        parentNode.appendChild(target);

        target.setAttribute('data-title', fileName);
        target.classList.add('has-layers');
        target.classList.add('overlay');

        const offset = LAYERS.length;

        function closeMe(e) {
          if (e && (e.target !== target)) {
            return;
          }

          LAYERS.splice(offset, 1);
          parentNode.removeChild(target);
        }

        target.addEventListener('click', closeMe);
        LAYERS.push(() => closeMe());

        setTimeout(() => {
          target.classList.add('active');

          setTimeout(() => {
            const display = !values[0].match(/\.(svg|gif|png|jpe?g)$/)
              ? document.createElement('iframe')
              : document.createElement('img');

            if (display.tagName === 'IFRAME') {
              display.setAttribute('width', 853);
              display.setAttribute('height', 505);
            }

            display.style.opacity = 0;
            display.src = values[0];

            target.appendChild(display);

            setTimeout(() => {
              display.style.opacity = 1;
            }, 100);
          }, 100);
        });
      }}
    >{fileName}</a>;
  },
  sum(data, values) {
    return values.map(x => x.reduce((prev, cur) => prev + cur, 0)).join(', ');
  },
  val(data, values) {
    return values[0].join(', ');
  },
};
