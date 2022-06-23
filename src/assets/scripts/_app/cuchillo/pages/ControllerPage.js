import Page from './Page';
import { GetBy } from '../core/Element';
import LoaderController from '../loaders/LoaderController';
import { Analytics } from '../core/Analytics';
import { ControllerWindow } from '../windows/ControllerWindow';
import { Scroll } from '../scroll/Scroll';

export const ControllerPage = {
  host: new URL(window.location).host,
  container: null,
  loader: null,
  page: null,
  pageOut: null,
  state: 0, //ALL OK 1: RUNNING 2:WAITING FOR NEXT
  firsTime: true,
  userAction: false,
  _directHref: "",
  _selector: "",
  _historyType: false,
  _waitingData: null,
  _preloadHref: false,
  _cont: 0,
  dataStates: [],
  pageClasses: {},


  init: function (__container) {
    this.container = __container;
    this._loader = LoaderController._loaders.PagesLoader;

    window.onpopstate = () => { this.popState(); };

    setTimeout(() => {
      this.pushState({ scrollX: window.pageXOffset, scrollY: window.pageYOffset }, null, window.location.href);
      this._continueLoad();
    }, 100);
  },

  _addPage: function (__id, __class) {
    this.pageClasses[__id] = __class;
  },

  enable_ESC_Mode (__isON = true) {
    if (__isON) {
      Keyboard.remove("Escape", "Page_ESC");
      Keyboard.add("Escape", "Page_ESC", () => { this.back(); });
    } else {
      Keyboard.remove("Escape", "Page_ESC");
    }
  },

  back (__safeURL = null) {
    if (ControllerPage.dataStates.length > 1) {
      history.back();
    } else if (__safeURL) {
      this.changePage(__safeURL);
    } else {
      this.changePage(GetBy.id("BackLINK").value);
    }
  },

  popState () {
    this._cont--;
    this.dataStates.pop();
    this._hidePage();
  },

  pushState (__data, __title, __url) {
    this._cont++;
    this.dataStates.push({ data: __data, title: __title, url: __url });
    history.pushState(__data, __title, __url);
  },

  replaceState (__data, __title, __url) {
    this.dataStates[this.dataStates.length - 1] = { data: __data, title: __title, url: __url };
    history.replaceState(__data, __title, __url);
  },

  changePage: function (__href = "", __historyType = "push", __selector = "main", __section = null) {
    if (__href === ControllerPage._directHref) {
      this.state = 0;
    } else {
      if (this.state === 0) {
        this.state = 1;
        this.userAction = true;
        this._directHref = __href;
        this._historyType = __historyType;
        this._selector = __selector;

        if (this._historyType === "push") {
          history.replaceState({ scrollX: -Scroll.x, scrollY: -Scroll.y }, null, window.location.href);
          this.dataStates[this.dataStates.length - 1].data = { scrollX: -Scroll.x, scrollY: -Scroll.y }

          ControllerPage.pushState({ scrollX: 0, scrollY: 0, section: __section }, null, this._directHref);
        } else {
          ControllerPage.replaceState({ scrollX: 0, scrollY: 0, section: __section }, null, this._directHref);
        }

        this._hidePage();

      } else {
        this.state = 2;
        this._waitingData = { _directHref: __href, _historyType: __historyType, _selector: __selector, _section: __section }
      }
    }
  },

  disposeOut: function () {
    if (this.pageOut != null) {
      this.pageOut._dispose();
      this.pageOut = null;

      if (this.state < 2) {
        this.state = 0;
      } else {
        this.state = 0;
        this.changePage(
          this._waitingData._directHref,
          this._waitingData._historyType,
          this._waitingData._selector,
          this._waitingData._section
        );
      }
    }
  },

  _hidePage: function () {
    if (this.firsTime) this._loadPage();
    else {
      if (this.page) {
        this.page._hide();
      }
    }
  },

  preloadPage: function (__href) {
    if (!ControllerPage._loader.getData(__href) && ControllerPage._preloadHref !== __href) {
      ControllerPage._preloadHref = __href;
      ControllerPage._loader.loadPage(ControllerPage._preloadHref, function () {
        ControllerPage._preloadHref = null
      });
    }
  },

  _loadPage: function () {
    this.pageOut = this.page;
    this.page = null;

    if (this.firsTime) {
      this.continueLoad();
    } else {
      this._directHref = window.location.href; //Utils.UrlManager.url;
      let _p = ControllerPage._loader.getData(ControllerPage._directHref);

      if (_p != null) {
        const dataPage = ControllerPage._parsePage(_p.page);
        ControllerPage._renderPage(dataPage);
        ControllerPage._continueLoad();

        Analytics.sendUrl(ControllerPage._directHref, dataPage.title);
      } else {
        const pageLoaded = (__data) => {
          ControllerPage._preloadHref = null;

          const dataPage = ControllerPage._parsePage(__data.page);
          ControllerPage._renderPage(dataPage);
          ControllerPage._continueLoad();

          Analytics.sendUrl(ControllerPage._directHref, dataPage.title);
        };

        if (ControllerPage._preloadHref === ControllerPage._directHref) {
          ControllerPage.onFileLoaded = pageLoaded;
        } else {
          ControllerPage._loader.loadPage(ControllerPage._directHref, pageLoaded)
        }
      }
    }
  },

  _parsePage: function (__page) {
    var data = __page;
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(data, "text/html");
    let alternates = [];

    [...GetBy.selector('[rel="alternate"]', xmlDoc.documentElement)].map(item => {
      alternates.push({
        hreflang: item.getAttribute("hreflang"),
        href: item.getAttribute("href"),
      });
    });

    return {
      canonical: GetBy.selector('[rel="canonical"]', xmlDoc.documentElement)[0].getAttribute("href"),
      alternates: alternates,
      og: {
        title:GetBy.selector('[property="og:title"]', xmlDoc.documentElement)[0].getAttribute("content"),
        type:GetBy.selector('[property="og:type"]', xmlDoc.documentElement)[0].getAttribute("content"),
        url:GetBy.selector('[property="og:url"]', xmlDoc.documentElement)[0].getAttribute("content"),
        image:GetBy.selector('[property="og:image"]', xmlDoc.documentElement)[0].getAttribute("content"),
        site_name:GetBy.selector('[property="og:site_name"]', xmlDoc.documentElement)[0].getAttribute("content"),
        description:GetBy.selector('[property="og:description"]', xmlDoc.documentElement)[0].getAttribute("content"),
      },
      twitter: {
        title:GetBy.selector('[property="twitter:title"]', xmlDoc.documentElement)[0].getAttribute("content"),
        card:GetBy.selector('[property="twitter:card"]', xmlDoc.documentElement)[0].getAttribute("content"),
        url:GetBy.selector('[property="twitter:url"]', xmlDoc.documentElement)[0].getAttribute("content"),
        description:GetBy.selector('[property="twitter:description"]', xmlDoc.documentElement)[0].getAttribute("content"),
        image:GetBy.selector('[property="twitter:image"]', xmlDoc.documentElement)[0].getAttribute("content"),
      },

      title: GetBy.selector("title", xmlDoc.documentElement)[0].innerText,
      description: GetBy.selector('[name="description"]', xmlDoc.documentElement)[0].getAttribute("content"),
      page: xmlDoc.documentElement.getElementsByClassName("wrap")[0]
    };
  },

  _renderPage: function(__data) {
    ControllerPage.container.insertBefore(__data.page, ControllerPage.container.firstChild);
    /* METAS */
    document.title = __data.title;
    document.querySelector('meta[name="description"]').setAttribute("content", __data.description);
    document.querySelector('link[rel="canonical"]').setAttribute("content", __data.canonical);
    /* OG */
    document.querySelector('meta[property="og:title"]').setAttribute("content", __data.og.title);
    document.querySelector('meta[property="og:type"]').setAttribute("content", __data.og.type);
    document.querySelector('meta[property="og:url"]').setAttribute("content", __data.og.url);
    document.querySelector('meta[property="og:image"]').setAttribute("content", __data.og.image);
    document.querySelector('meta[property="og:site_name"]').setAttribute("content", __data.og.site_name);
    document.querySelector('meta[property="og:description"]').setAttribute("content", __data.og.description);
    /* TWITTER */
    document.querySelector('meta[property="twitter:title"]').setAttribute("content", __data.twitter.title);
    document.querySelector('meta[property="twitter:card"]').setAttribute("content", __data.twitter.card);
    document.querySelector('meta[property="twitter:url"]').setAttribute("content", __data.twitter.url);
    document.querySelector('meta[property="twitter:description"]').setAttribute("content", __data.twitter.description);
    document.querySelector('meta[property="twitter:image"]').setAttribute("content", __data.twitter.image);
    /* LANGS */
    __data.alternates.map(item => {
      document.querySelector(`link[hreflang="${item.hreflang}"]`).setAttribute("href", item.href);
      document.querySelector(`[data-hreflang="${item.hreflang}"]`).setAttribute("href", item.href);
    });
  },

  _continueLoad: function () {
    this.page = ControllerPage.getTypePage();
    this.page._load(ControllerPage.firsTime);
    this.firsTime = false;
  },

  //PAGES
  getTypePage: function () {
    const pageId = GetBy.selector('[data-page]')[0].getAttribute("data-page");
    const page = this.pageClasses[pageId] || Page;

    if (!this.pageClasses[pageId]) {
      console.warn(`data-page [${pageId}] no existe, posiblemente no hayas hecho el import`);
    }

    return new page();
  },

  loop: function () {
    if (ControllerPage.pageOut) ControllerPage.pageOut.loop();
    if (ControllerPage.page) ControllerPage.page.loop();
  },

  resize: function () {
    if (ControllerPage.page) ControllerPage.page.resize();
  },

  isUrlSameHost: function (__hrefURL) {
    return (__hrefURL.startsWith("/") || new URL(__hrefURL).host === this.host);
  }
};
