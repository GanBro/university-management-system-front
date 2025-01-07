import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import dashboard from './modules/dashboard'
import university from '@/store/modules/university'
import upload from '@/store/modules/upload'
import interaction from '@/store/modules/interaction'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    dashboard,
    university,
    upload,
    interaction
  },
  getters
})

export default store
