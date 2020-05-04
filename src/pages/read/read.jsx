/**
 * @Author 随意
 * @Date 2020/3/4 12:04
 * @Desc
 */
import Taro, {Component} from '@tarojs/taro'
import {View, Text, Swiper, SwiperItem, Image} from '@tarojs/components'
import {observer, inject} from '@tarojs/mobx'
import {AtTabBar, AtNavBar, AtIcon} from 'taro-ui'

import './index.scss'


@inject('menuStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menus: [],
      current: 0
    }
  }

  config = {
    navigationBarTitleText: '阅读'
  }

  componentDidMount() {
    const {menuStore: {menus}} = this.props
    this.setState({
      menus: menus.slice()
    })
  }

  // 菜单点击事件
  handleMenuClick = (current) => {
    this.setState({current})
    Taro.navigateTo({
      url: '../detail/index'
    }).then(() => {
      console.log('离开列表页了')
    })
  }

  // 查看详情
  handleModuleClick = () => {
    Taro.navigateTo({
      url: '../detail/index'
    })
  }

  render() {
    const menus = this.state.menus
    return (
      <View className='read' name='pages/read/index'>
        12315165156
        {/*<AtNavBar*/}
        {/*color='#000'*/}
        {/*title={menus[0] && menus[0].name || ''}*/}
        {/*leftText='返回'*/}
        {/*leftIconType='chevron-left'*/}
        {/*onClickLeftIcon={this.handleClickLeftIcon}*/}
        {/*/>*/}
        <View className='read-content'>
          {/*轮播*/}
          <View className='read-playArea'>
            <Swiper className='test-h' indicatorColor='#999' indicatorActiveColor='#333' circular indicatorDots>
              {
                [1, 2, 3].map((v) => (
                  <SwiperItem>
                    <View>
                      <Image src={require('../../assets/images/timg.jpg')} />
                    </View>
                  </SwiperItem>
                ))
              }
            </Swiper>
          </View>
          {/*列表*/}
          <View className='read-list'>
            <View className='read-list_top'>
              <Text>已购课程</Text>
              <Text>发现更多》</Text>
            </View>
            <View className='read-list_box'>
              <View className='read-list_container'>
                {
                  [1, 2, 3,4,65,6].map(() => (
                    <View className='read-list_module' onClick={this.handleModuleClick}>
                      <View className='read-list_img'>
                        <Image className='read-list_moduleImg' src={require('../../assets/images/music.jpg')} />
                      </View>
                      <View className='read-list_text'>
                        <Text>21天ACG动漫口语研习社</Text>
                        <Text>》</Text>
                      </View>
                    </View>
                  ))
                }
              </View>
            </View>
          </View>
        </View>
        {/*/!*导肮菜单*!/*/}
        {/*<AtTabBar*/}
          {/*className='read-footer'*/}
          {/*iconSize={24}*/}
          {/*fontSize={14}*/}
          {/*fixed*/}
          {/*current={this.state.current}*/}
          {/*tabList={[*/}
            {/*...menus.map(menu => ({title: menu.name, iconType: menu.icon}))*/}
          {/*]}*/}
          {/*onClick={this.handleMenuClick}*/}
        {/*/>*/}

      </View>
    )
  }
}

export default Index
