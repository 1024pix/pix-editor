
import { toDisplayString as _toDisplayString, createElementVNode as _createElementVNode, createTextVNode as _createTextVNode, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

const _hoisted_1 = { class: "greetings" }
const _hoisted_2 = { class: "green" }

export default { render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createElementVNode("h1", _hoisted_2, _toDisplayString(_ctx.msg), 1 /* TEXT */),
    _cache[0] || (_cache[0] = _createElementVNode("h3", null, [
      _createTextVNode(" You’ve successfully created a project with "),
      _createElementVNode("a", {
        href: "https://vite.dev/",
        target: "_blank",
        rel: "noopener"
      }, "Vite"),
      _createTextVNode(" + "),
      _createElementVNode("a", {
        href: "https://vuejs.org/",
        target: "_blank",
        rel: "noopener"
      }, "Vue 3"),
      _createTextVNode(". ")
    ], -1 /* CACHED */))
  ]))
},
  props: {
  msg: {
    type: String,
    required: true,
  },
},
  setup(__props, { expose: __expose }) {
  __expose();



const __returned__ = {  }

return __returned__
}

}