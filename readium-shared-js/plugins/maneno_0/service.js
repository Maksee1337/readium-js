define(['jquery'], function ($) {    return function () {        let self = this;        this.getTOC = function (dom) {            $('script', dom).remove();            var $navs = $('nav', dom);            let tocNav;            Array.prototype.every.call($navs, function (nav) {                if (nav.getAttributeNS('http://www.idpf.org/2007/ops', 'type') === 'toc') {                    tocNav = nav;                    return false;                }                return true;            });            const toc = (tocNav && $(tocNav).html()) || $('body', dom).html() || $(dom).html();            const result = [];            $.each($(toc).find('li > a'), (i, v) => {                const href = v.href.replace(/^.*[\\\/]/, '');                const idref = href.split('-')[0];                result.push({title: v.textContent, href, idref})            })            return result;        }        this.updateInfo = function (element, callback) {        }    }});