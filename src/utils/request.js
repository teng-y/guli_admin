import axios from 'axios'
import { MessageBox, Message } from 'element-ui'
import store from '@/store'


// create an axios instance
const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 20000 // request timeout
})

// const service = axios.create({
//   baseURL:....,
//   timeout:20000
// })

// service.interceptors.request.use(config=>{

// })
// service.interceptors.response.use(response=>{

// },error=>{

// })
// request interceptor
service.interceptors.request.use(
  config => {
    // do something before request is sent
    // console.log(store.state.user);
    if (store.getters.token) {
      // let each request carry token
      // ['X-Token'] is a custom headers key
      // please modify it according to the actual situation
      // config.headers['X-Token'] = getToken()//修改
      // config.headers['token'] = localStorage.getItem('token_key')//修改
      config.headers['token'] = store.getters.token
    }
    return config
  },
  //一般情况下请求拦截器的错误信息可以不写
  // error => {
  //   // do something with request error
  //   console.log(error) // for debug
  //   return Promise.reject(error)
  // }
)

// response interceptor
service.interceptors.response.use(
  /**
   * If you want to get http information such as headers or status
   * Please return  response => response
  */

  /**
   * Determine the request status by custom code
   * Here is just an example
   * You can also judge the status by HTTP Status Code
   */
  response => {
    const res = response.data

    // if the custom code is not 20000, it is judged as an error.
    if (res.code !== 20000 && res.code !== 200) {
      //配置对象
      Message({
        message: res.message || 'Error',
        type: 'error',
        duration: 5 * 1000
      })

      // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
      if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
        // to re-login
        MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
          confirmButtonText: 'Re-Login',
          cancelButtonText: 'Cancel',
          type: 'warning'
        }).then(() => {
          store.dispatch('user/resetToken').then(() => {
            location.reload()
          })
        })
      }
      return Promise.reject(new Error(res.message || 'Error'))
    } else {
      return res
    }
  },
  error => {
    console.log('err' + error) // for debug
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
