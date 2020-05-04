/**
 * @Author 随意
 * @Date 2020/3/3 14:19
 * @Desc
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtIcon, AtButton, AtSlider } from 'taro-ui'

import './index.scss'

// wx.cloud.init()

@inject('menuStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isPaused: true,
      swiperCurrent: 0,
      courseInfo: {},
      percentage: 0,
      currentTime: '00:00',
      duration: '00:00',
      innerAudioContext: Taro.createInnerAudioContext()
    }
  }

  config = {
    navigationBarTitleText: '详情'
  }

  componentDidMount () {
    const { innerAudioContext } = this.state
    innerAudioContext.onCanplay(() => {
      // 必须。
      innerAudioContext.play();
      innerAudioContext.stop();
      // innerAudioContext.duration;
      // 设置总时长
      let durationTimer = setInterval(() => {
        console.log('setInterval')
        if (innerAudioContext.duration > 0) {
          let durationFormat = `${String(parseInt(innerAudioContext.duration / 60)).padStart(2, '0')}:${String(parseInt(innerAudioContext.duration % 60)).padStart(2, '0')}`
          this.setState({ duration: durationFormat })
          clearInterval(durationTimer)
          durationTimer = null
        }
      }, 1000)
    })

  }

  componentDidShow () {
    wx.cloud.database().collection('jpan_course').where({ _id: this.$router.params.id }).get().then(res => {
      console.log(res);
      this.setState({
        courseInfo: res.data[0]
      })
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: res.data[0].audio,
          maxAge: 60 * 60, // one hour
        }]
      }).then(data => {
        // get temp file URL
        console.log(data)
        this.setState(prevState => {
          prevState.innerAudioContext['src'] = data.fileList[0].tempFileURL
          prevState.isPaused = true
        })
      })
    })
  }

  componentDidHide () {
    this.state.innerAudioContext.stop()
  }

  // 跳转至朗读
  handleOptionsClick = () => {
    Taro.navigateTo({
      url: `../deacon/index?id=${this.state.courseInfo._id}`
    })
  }

  // 后退
  handlePrev = () => {
    this.state.innerAudioContext.stop()
  }

  /**
   * 前进
   */
  handleNext = () => {
    this.state.innerAudioContext.stop()
  }
  // 轮播图滑动
  handleSwiperChange = (e) => {
    console.log(e)
    this.setState({
      swiperCurrent: e.detail.current
    })
  }

  /**
   * 播放/暂停 按钮
   */
  handlePlay = () => {
    let { isPaused } = this.state
    if (isPaused) {
      this.audioPlay()
    } else {
      this.audioPause()
    }
  }
  /**
   * 播放
   */
  audioPlay = () => {
    const { innerAudioContext } = this.state
    innerAudioContext.play()
    innerAudioContext.onPlay(() => {
      this.setState(() => ({
        isPaused: false
      }), () => {
        this.bindInnerAudioCtxHandler()
      })
    })
  }
  /**
   * 暂停
   */
  audioPause = () => {
    const { innerAudioContext } = this.state
    innerAudioContext.pause()
    this.setState(() => ({
      isPaused: true
    }))
  }
  /**
   * 如果语音还在播放就暂停
   */
  clearPlay = () => {
    !this.isPaused && this.audioPause()
  }
  /**
   * 给播放语音增加功能
   */
  bindInnerAudioCtxHandler = () => {
    let { innerAudioContext, isPaused } = this.state
    // 播放结束
    innerAudioContext.onEnded(() => {
      this.setState({
        percentage: 0
      })
    })
    // 更新进度条
    innerAudioContext.onTimeUpdate(() => {
      // 只有在播放的时候，才刷新进度条
      if (!isPaused) {
        const { currentTime, duration } = innerAudioContext
        this.setState((prevState) => {
          prevState.currentTime = `${String(parseInt(currentTime / 60)).padStart(2, '0')}:${String(Math.ceil(currentTime % 60)).padStart(2, '0')}`,
            prevState.percentage = parseInt((currentTime / duration) * 100)
        })
        // parseInt(innerAudioContext.currentTime) >= audiosArr[0] + audiosArr[1] && innerAudioContext.stop()
      }
    })
  }
  render () {
    const { courseInfo, percentage, duration, currentTime, swiperCurrent, isPaused } = this.state
    return (
      <View className='outContainer detail'>
        <View className='detail-content'>
          {/*音频区域*/}
          <View className='detail-audio'>
            {
              swiperCurrent < 1 ? (
                <View className='detail-audio_title'>
                  <View className='detail-audio_days'>Day 3</View>
                  <View className='detail-audio_text'>Day.3 在飞机上</View>
                </View>
              ) : (
                  <View className='detail-audio_container'>
                    <View className='detail-audio_timebar'>
                      <Text>{currentTime}</Text>
                      <AtSlider
                        className='detail-audio_progress'
                        step={1}
                        value={percentage}
                        activeColor='#4285F4'
                        backgroundColor='#BDBDBD'
                        blockColor='#4285F4'
                        blockSize={14}
                      >
                      </AtSlider>
                      <Text>{duration}</Text>
                    </View>
                    <View className='detail-audio_button'>
                      <View className='detail-audio_prev' onClick={this.handlePrev}><AtIcon value='prev' size='20'></AtIcon></View>
                      <View className='detail-audio_play' onClick={this.handlePlay}><AtIcon value={isPaused ? 'play' : 'pause'} size='20'></AtIcon></View>
                      <View className='detail-audio_next' onClick={this.handleNext}><AtIcon value='next' size='20'></AtIcon></View>
                    </View>
                  </View>
                )
            }
          </View>
          {/*播放区域*/}
          <View className='detail-playArea'>
            {
              courseInfo.cn ? (
                <Swiper
                  className='swiper-container'
                  indicatorColor='#aaa'
                  indicatorActiveColor='#fff'
                  circular
                  indicatorDots
                  onChange={this.handleSwiperChange}
                >
                  <SwiperItem className='detail-swiperItem'>
                    <View className='detail-playArea_icon'>
                      <Image
                        className='detail-playArea_img'
                        style='background: #fff;'
                        src={courseInfo.files[0].url}
                      />
                      <View className='detail-playArea_time'>
                        <Text>{currentTime}</Text>/<Text>{duration}</Text>
                      </View>
                    </View>
                  </SwiperItem>
                  <SwiperItem className='detail-swiperItem'>
                    <View className='detail-playArea_list'>
                      {
                        courseInfo.cn && courseInfo.cn.split('\n').map(v => {
                          return (
                            <View key={v} className='detail-playArea_listItem'><Text>{v}</Text></View>
                          )
                        })
                      }
                    </View>
                  </SwiperItem>
                  <SwiperItem className='detail-swiperItem'>
                    <View className='detail-playArea_list'>
                      {
                        courseInfo.jp && courseInfo.jp.split('\n').map(v => {
                          return (
                            <View key={v} className='detail-playArea_listItem'><Text>{v}</Text></View>
                          )
                        })
                      }
                    </View>
                  </SwiperItem>
                </Swiper>
              ) : (
                  <View className='noData'>暂无数据</View>
                )
            }
          </View>
          <View className='detail-options'>
            <AtButton className='detail-options_button' type='secondary' circle size='small'>循环播放</AtButton>
            <AtButton className='detail-options_button detail-options_buttonDeacon' type='secondary' circle size='small' onClick={this.handleOptionsClick}>朗读训练</AtButton>
          </View>
        </View>

      </View>
    )
  }
}

export default Index
