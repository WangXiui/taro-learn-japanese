/**
 * @Author 随意
 * @Date 2020/3/4 12:04
 * @Desc
 */
import Taro, {Component} from '@tarojs/taro'
import {View, Text, Swiper, SwiperItem, Image, ScrollView} from '@tarojs/components'
import {observer, inject} from '@tarojs/mobx'

import './index.scss'

// wx.cloud.init()
@inject('menuStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfo: Taro.getStorageSync('userinfo') || {},
      list:[]
    }
  }

  config={
    navigationBarTitleText: '首页'
  }

  componentDidMount() {}
  componentDidShow() {
    if (process.env.TARO_ENV === 'weapp')  {
      // 找库，排序
      wx.cloud.database().collection('jpan_course').get().then(res => {
        console.log(res);
        this.setState({
          list: res.data
          // list: this.state.list.concat(res.data)
        })
      })
    }
  }

  // 查看详情
  handleModuleClick = (info) => {
    console.log(info);
    Taro.navigateTo({
      url: `../detail/index?id=${info._id}`
    })
  }

  render() {
    const {list} = this.state
    return (
      <View className='outContainer index'>
        <View className='index-content'>
          {/*轮播*/}
          <View className='index-playArea'>
            <Swiper className='test-h' indicatorColor='#999' indicatorActiveColor='#333' circular indicatorDots>
              {
                [1, 2, 3].map((v) => (
                  <SwiperItem key={v}>
                    <View className='index-playArea_loop'>
                      <Image className='index-playArea_loopImg' src={require('../../assets/images/timg.jpg')} />
                    </View>
                  </SwiperItem>
                ))
              }
            </Swiper>
          </View>
          {/*列表*/}
          <View className='index-list'>
            <View className='index-list_top'>
              <Text>已购课程</Text>
              <Text onClick={()=>this.handleModuleClick({_id: 11})}>发现更多》</Text>
            </View>
            <View className='index-list_box'>
              {
                list.length>0 ? (
                  <View className='index-list_container'>
                    {
                      this.state.list.map((item, key) => (
                        <View key={key} className='index-list_module' onClick={()=>this.handleModuleClick(item)}>
                          <View className='index-list_img'>
                            <Image className='index-list_moduleImg' src={item.files[0].url} />
                          </View>
                          <View className='index-list_text'>
                            <Text>{item.title}</Text>
                            <Text>》</Text>
                          </View>
                        </View>
                      ))
                    }
                  </View>
                ) : (
                  <View className='noData'>暂无数据</View>
                )
              }
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
