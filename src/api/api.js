import axios from 'axios'
import qs from 'qs'
import store from '../store';
import { Message } from 'element-ui'
import router from '../router';

let ax = axios.create({
  withCredentials: true, // 允许cookie
  baseURL: process.env.VUE_APP_BASE_PATH, // 接口地址
  headers: {
    'stem-cell-language': localStorage.getItem('lang') || 'en'
  }
})

// 添加响应拦截器
ax.interceptors.response.use(res => {
  store.commit('SET_LOADING', false)
  if (res.data.resultCode === "NOT_LOGGEDIN") {
    store.commit('CLEAR_ACCOUNT')
    router.push('/login')
  } else if (!res.data.success && res.data.msg) {
    Message.error(res.data.msg)
  }

  return res
})

export default {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      ax({
        url,
        method: 'get',
        params: params
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  },
	/*eslint-disable*/
  post: (url, params) => {
    if (params && params.loading === true) {
      delete params.loading
      store.commit('SET_LOADING', true)
    }
	  // 删除参数值为空的参数
	  for (let i in params) {
		  if(params[i] === '') {
			  delete params[i]
		  }
	  }
    return new Promise((resolve, reject) => {
      ax({
        method: 'post',
        url,
        data: qs.stringify(params)
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  },

	postArr: (url, params) => {
		if (params && params.loading) {
			store.commit('SET_LOADING', params.loading)
			delete params.loading
		}

		// 删除参数值为空的参数
		for (let i in params) {
			if(params[i] === '') {
				delete params[i]
			}
		}

		return new Promise((resolve, reject) => {
			ax({
				method: 'post',
				url,
				data: params,
				paramsSerializer: function(params) {
					return qs.stringify(params, {arrayFormat: 'repeat'})
				}
			}).then(res => {
				resolve(res.data)
			}).catch(err => {
				reject(err)
			})
		})
	},
  post2: (url, params, cancelToken) => { // 可以取消的请求
    return new Promise((resolve, reject) => {
      ax({
        method: 'post',
        url,
        data: qs.stringify(params),
        cancelToken
      }).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  },
  postFormdata: (url, params) => {
    return new Promise((resolve, reject) => {
      ax.post(url, params).then(res => {
        resolve(res.data)
      }).catch(err => {
        reject(err)
      })
    })
  }
}
