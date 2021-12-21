import request from '@/utils/request'

export function login(user) {
  return request({
    url: '/admin/acl/index/login',
    method: 'post',
    data:user
  })
}

export function getInfo(token) {
  return request({
    url: '/admin/acl/index/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/admin/acl/index/logout',
    method: 'post'
  })
}
