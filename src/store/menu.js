/**
 * @Author 随意
 * @Date 2020/3/2 11:53
 * @Desc
 */
import {observable} from 'mobx'

const menuStore = observable({
  menus: [
    {
      name: '发现',
      path: 'index',
      icon: 'bullet-list'
    },{
      name: '阅读',
      path: 'read',
      icon: 'camera'
    },{
      name: '我的',
      path: 'add',
      icon: 'folder'
    }
  ]
})

export default menuStore
