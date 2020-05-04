import 'taro-ui/dist/style/index.scss'
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'
import Index from './pages/index'
import './assets/icon.scss'


import counterStore from './store/counter'
import menuStore from './store/menu'

import './app.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
// if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5')  {
//   require('nerv-devtools')
// }

const store = {
  counterStore,
  menuStore
}

class App extends Component {
  config = {
    pages: [
      'pages/index/index',
      'pages/deacon/index',
      'pages/detail/index',
      'pages/add/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#fff',
      navigationBarTitleText: 'WeChat',
      navigationBarTextStyle: 'black'
    },
    tabBar: {
      color: "#1296db",
      selectedColor: "#13227a",
      backgroundColor: "#fafafa",
      borderStyle: 'black',
      list: [{
        pagePath: "pages/index/index",
        iconPath: "assets/images/read.png",
        selectedIconPath: "assets/images/read_active.png",
        text: "阅读"
      },{
        pagePath: "pages/add/index",
        iconPath: "assets/images/me.png",
        selectedIconPath: "assets/images/me_active.png",
        text: "我的"
      }]
    }
  }

  componentDidMount () {
    console.log('必须是在用户已经授权的情况下调用');
    // 必须是在用户已经授权的情况下调用
    wx.cloud.init()
    wx.cloud.callFunction({
      name: 'login',
      success: (e) => {
        console.log(e)
        const userInfo = e.result
        Taro.setStorageSync('userinfo', userInfo) // 同步存储
      }
    })
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
