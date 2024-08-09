import {toast} from 'vue3-toastify'

export default {
  methods: {
    toast(title) {
      toast(title, {
        theme: 'dark',
        type: 'info',
        position: toast.POSITION.BOTTOM_LEFT
      })
    }
  }
}