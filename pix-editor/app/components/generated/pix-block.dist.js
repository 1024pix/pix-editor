
import { renderSlot as _renderSlot, normalizeClass as _normalizeClass, openBlock as _openBlock, createElementBlock as _createElementBlock } from "vue"

export default { render(_ctx, _cache) {
  return (_openBlock(), _createElementBlock("div", {
    class: _normalizeClass(["pix-block", {
      [`pix-block--${_ctx.variant}`]:true,
      'pix-block--condensed': _ctx.condensed,
    }])
  }, [
    _renderSlot(_ctx.$slots, "default")
  ], 2 /* CLASS */))
},
  props: {
  variant: { type : String, default: "primary", validator: (value) => {
    return ['primary', 'certif', 'orga', 'admin'].includes(value);
    } },
  condensed: { type: Boolean, default: false },
},
  setup(__props, { expose: __expose }) {
  __expose();



const __returned__ = {  }

return __returned__
}

}