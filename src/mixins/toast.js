import {toast} from 'vue3-toastify'

export default {
  methods: {
    toast(title, options = {}) {
      toast(title, {...{
        theme: 'dark',
        type: 'info',
        position: toast.POSITION.BOTTOM_LEFT,
        autoClose: 3000
      }, ...options})
    }
  }
}