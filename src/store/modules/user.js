import { login, logout, getInfo } from '@/api/user'
// import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token:localStorage.getItem('token_key'),
  name:'',
  avatar:''
}
const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_USERINFO(state,userInfo){
    state.name = userInfo.name
    state.avatar = userInfo.avatar
  },
  RESET_STATE(state){
    state.token = ''
    state.name = ''
    state.avatar = ''
  }
}

const actions = {
  // user login
  async userLogin({commit},userInfo){
    const result = await login(userInfo)  
    if(result.code === 20000 || result.code===200){
      localStorage.setItem('token_key',result.data.token)
      commit('SET_TOKEN',result.data.token)
 
      return 'ok'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },

  // get user info
  async getUserInfo({commit},token){
    const result = await getInfo(token)
    // console.log(result);
    if(result.code === 20000 || result.code===200){
      commit('SET_USERINFO',result.data)
      return 'ok'
    }else{
      return Promise.reject(new Error('failed'))
    }
  },
  // user logout
  async logout({commit,dispatch}){
    const result = await logout()
    if(result.code === 20000 || result.code===200){
      // commit('RESET_STATE')
      // localStorage.removeItem('token_key')
      dispatch('resetToken')
      resetRouter()
      return 'ok'
    }else{
      return Promise.reject('failed')
    }
  },
  //remove token
  async resetToken({ commit }) {
    localStorage.removeItem('token_key')
    commit('RESET_STATE')
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

