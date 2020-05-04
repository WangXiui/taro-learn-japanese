/**
 * @Author 随意
 * @Date 2020/3/3 11:01
 * @Desc
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Text, Swiper, SwiperItem } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtIcon, AtBadge, AtSlider } from 'taro-ui'

import './index.scss'

const db = wx.cloud.database()

@inject('menuStore')
@observer
class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      userInfo: Taro.getStorageSync('userinfo') || {},
      isRecord: false,  //是否正在录音
      isPaused: true, //是否暂停
      isFllow: false, //是否在跟读
      addr: '', //录音地址
      materialAddr: '', //材料地址
      innerAudioContext: Taro.createInnerAudioContext(),  //材料上下文
      innerAudioCtxFollow: Taro.createInnerAudioContext(),  //跟读上下文
      courseInfo: {}, //课程信息
      percentage: 0,  //播放进度
      currentTime: '00:00', //当前播放时间
      duration: '00:00',  //总时长
      // audiosArr: [10, 15, 20]  //给时长分段
    }
  }

  config = {
    navigationBarTitleText: '朗读'
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
    // wx.cloud.init()
    this.getRecorder()
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
          prevState.materialAddr = data.fileList[0].tempFileURL
          prevState.isPaused = true
        })
      })
    })
  }
  // 获取上次已保存录音
  getRecorder = () => {
    const { openid } = this.state.userInfo
    wx.cloud.database().collection('jpan_user').where({ _openid: openid, courseID: this.$router.params.id }).get().then(res => {
      console.log(res);
      res.data.length > 0 && this.setState(prevState => {
        prevState.innerAudioCtxFollow['src'] = res.data[res.data.length - 1].fileID
        prevState.addr = { tempFilePath: res.data[res.data.length - 1].fileID }
      })
    })
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
        console.log('更新进度条:进来了')
        const { currentTime, duration } = innerAudioContext
        this.setState((prevState) => {
          prevState.currentTime = `${String(parseInt(currentTime / 60)).padStart(2, '0')}:${String(Math.ceil(currentTime % 60)).padStart(2, '0')}`,
            prevState.percentage = parseInt((currentTime / duration) * 100)
        })
        // parseInt(innerAudioContext.currentTime) >= audiosArr[0] + audiosArr[1] && innerAudioContext.stop()
      }
    })
  }
  componentDidHide () {
    console.log('componentDidHide')
    this.state.innerAudioContext.stop()
    this.state.innerAudioCtxFollow.stop()
  }

  componentWillUnmount () {
    console.log('componentWillUnmount')
    this.state.innerAudioContext.stop()
    this.state.innerAudioCtxFollow.stop()
  }

  /**
   * 播放/暂停 按钮
   */
  handlePlay = () => {
    let { isPaused } = this.state
    if (isPaused) {
      // innerAudioContext.seek(audiosArr[0])
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
   * 播放跟读
   */
  handleFollow = () => {
    const { addr, innerAudioCtxFollow, isFllow } = this.state
    this.setState({
      isFllow: !isFllow
    })
    // 如果正在跟读就暂停，否则开始
    if (isFllow) {
      Taro.hideLoading()
      return
    } else if (addr.tempFilePath) {
      this.clearPlay()
      innerAudioCtxFollow.play()
      innerAudioCtxFollow.onPlay(() => {
        Taro.showLoading({
          title: '正在播放录音',
          icon: 'loading'
        })
      })
    }
    // 跟读结束
    innerAudioCtxFollow.onEnded(() => {
      Taro.hideLoading()
    })
  }
  /**
   * 点击录音，判断开始还是结束
   */
  handleRecord = () => {
    // 如果语音还在播放就暂停
    !this.isPaused && this.audioPause()
    let { isRecord } = this.state
    !isRecord ? this.handleStartRecord() : this.handleEndRecord()
    this.setState({
      isRecord: !isRecord
    })
  }
  // 录音开始（微信小程序）
  handleStartRecord = () => {
    if (process.env.TARO_ENV === 'weapp') {
      wx.getRecorderManager().start({ duration: 6000 })
      console.log(wx.getRecorderManager());
      wx.getRecorderManager().onStart(() => {
        console.log('录音开始了');
        this.clearPlay()
        // 显示loading
        Taro.showLoading({
          title: '正在录音',
          icon: 'loading'
        })
      })
    }
  }
  // 录音结束（微信小程序）
  handleEndRecord = () => {
    // if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'weapp')  {
    if (process.env.TARO_ENV === 'weapp') {
      // 隐藏loading
      Taro.hideLoading()
      let RecorderManager = wx.getRecorderManager()
      RecorderManager.stop()
      RecorderManager.onStop((addr) => {
        this.setState({
          addr: addr
        })
        const cloudPath = 'my-record' + addr.tempFilePath.match(/\.[^.]+?$/)[0]
        const filePath = addr.tempFilePath
        wx.cloud.uploadFile({
          cloudPath,
          filePath, // 文件路径
        }).then(res => {
          console.log('上传成功了');
          // get resource ID
          console.log(res.fileID)
          db.collection('jpan_user').add({
            data: {
              fileID: res.fileID,
              courseID: this.$router.params.id
            },
            success (add) {
              console.log('录音成功了:', add)
              // if(add._id){
              //   wx.hideLoading()
              //   wx.showModal({
              //     title: '添加成功',
              //     content: `图书《${result.title}》添加成功`,
              //   })
              // }
            }
          })
        }).catch(error => {
          // handle error
          console.log(error)
        })
      })
    }
  }

  render () {
    const { courseInfo, percentage, duration, currentTime, isPaused } = this.state
    return (
      <View className='outContainer deacon'>
        <View className='deacon-content'>
          {/*音频区域*/}
          <View className='deacon-audio'>
            <View className='deacon-audio_title'>
              <View>今日朗读训练 1/7</View>
            </View>
            <View className='deacon-audio_container'>
              {/*播放按钮*/}
              <View onClick={this.handlePlay}>
                {
                  isPaused ? (
                    <AtIcon className='deacon-audio_play' value='play' size={10}></AtIcon>
                  ) : (
                      <AtIcon className='deacon-audio_pause' value='pause' size={10}></AtIcon>
                    )
                }
              </View>
              {/*进度条*/}
              <View className='deacon-audio_timebar'>
                <AtSlider
                  className='deacon-audio_progress'
                  step={1}
                  value={percentage}
                  activeColor='#4285F4'
                  backgroundColor='#BDBDBD'
                  blockColor='#4285F4'
                  blockSize={14}
                >
                </AtSlider>
                {/*当前时间、总时间*/}
                <View className='deacon-audio_time'>
                  <Text>{currentTime}</Text>
                  <Text>{duration}</Text>
                </View>
              </View>
            </View>
          </View>
          {/*播放区域*/}
          <View className='deacon-playArea'>
            <Swiper
              className='swiperContainer'
              indicatorColor='#fff'
              indicatorActiveColor='#75c9da'
              circular
              indicatorDots
            >
              <SwiperItem className='deacon-playArea_text'>
                <View className='deacon-playArea_icon'>
                  <AtIcon prefixClass='icon' size={50} value='dyvmsyuyinfuwu' ></AtIcon>
                </View>
              </SwiperItem>
              <SwiperItem className='deacon-playArea_text'>
                <View className='deacon-playArea_swipertitle'>中日对照</View>
                <View className='deacon-playArea_list'>
                  {
                    courseInfo.cn && courseInfo.cn.split('\n').map(v => {
                      return (
                        <View key={v} className='detail-playArea_listItem'><Text>{v}</Text></View>
                      )
                    })
                  }
                </View>
              </SwiperItem>
              <SwiperItem className='deacon-playArea_text'>
                <View className='deacon-playArea_swipertitle'>中日对照</View>
                <View className='deacon-playArea_list'>
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
          </View>
          {/*录音操作区域*/}
          <View className='deacon-options'>
            <View className='deacon-options_play'>
              <Text>我的跟读</Text>
              <View onClick={this.handleFollow} className='deacon-options_badgeContainer'>
                {/*<View className='icon icon-shengboyuyinxiaoxi deacon-options_icon'></View>*/}
                <AtBadge className='deacon-options_badge' value={10}></AtBadge>
                <AtIcon className='deacon-options_followIcon' prefixClass='icon' size={18} value='shengboyuyinxiaoxi'></AtIcon>
              </View>
            </View>
            <View className='deacon-options_record'>
              <Text>点击录音</Text>
              <View onClick={this.handleRecord}>
                {/*<View className='icon icon-fs-record deacon-options_icon'></View>*/}
                <AtIcon className='deacon-options_recordIcon' prefixClass='icon' size={18} value='fs-record'></AtIcon>
              </View>
            </View>
          </View>
        </View>
      </View>
    )
  }
}

export default Index
