/**
 * @Author 随意
 * @Date 2020/3/6 14:26
 * @Desc
 */
import Taro, { Component } from '@tarojs/taro'
import { View, Text, ScrollView } from '@tarojs/components'
import { AtForm, AtInput, AtButton, AtImagePicker, AtTextarea, AtSlider } from 'taro-ui'
import './index.scss'

class Index extends Component {
  constructor(props) {
    super(props)
    this.state = {
      title: '',
      jp: '',
      cn: '',
      audio: '',
      files: [],
      filename: '',
      audioParts: [],
      during: 100,
      audioPath: 100,
      innerAudioContext: Taro.createInnerAudioContext()
    }
  }

  config = {
    'navigationBarTitleText': '新增'
  }

  // 提交
  handleOnSubmit = () => {
    const { title, jp, cn, files, audio } = this.state
    console.log(this.state)
    if (process.env.TARO_ENV === 'weapp') {
      // wx.cloud.init()
      wx.cloud.database().collection('jpan_course').add({
        data: {
          title, jp, cn, files, audio
        },
        success (res) {
          console.log(res);
          if (res._id) {
            wx.showModal({
              title: '添加成功',
              content: `${title} 添加成功`,
            })
          }
        }
      })
    }
  }
  // 重置
  handleOnReset = () => {
    this.setState({
      title: '',
      jp: '',
      cn: '',
      audio: '',
      files: [],
      filename: ''
    })
  }

  // files
  handleFilesChange = (files) => {
    this.setState({
      files
    })
  }
  // jp
  handleJpChange = (event) => {
    this.setState({
      jp: event.target.value
    })
  }
  // cn
  handleCnChange = (event) => {
    this.setState({
      cn: event.target.value
    })
  }
  // title
  handleTitleChange = (value) => {
    this.setState({
      title: value
    })
  }
  // audio
  handleAudioChange = (e) => {
    console.log(e);
    wx.chooseMessageFile({
      count: 1,
      // type: 'file',
      success: (res) => {
        // tempFilePath可以作为img标签的src属性显示图片
        // const tempFilePaths = res.tempFilePaths
        console.log(res);
        const file = res.tempFiles[0]
        const cloudPath = 'add-audio' + file.path.match(/\.[^.]+?$/)[0]
        const filePath = file.path
        this.setState({
          audioPath: file.path,
          filename: file.name,
        }, ()=>{
          this.getDuring()
        })
        wx.cloud.uploadFile({
          cloudPath,
          filePath, // 文件路径
        }).then(data => {
          console.log(`${file.name}上传成功了`);
          // get resource ID
          console.log(data.fileID)
          this.setState({
            audio: data.fileID
          })
        }).catch(error => {
          console.log(error)
        })
      }
    })
  }
  // 新增语音片段
  handleSliderAdd = () => {
    this.setState({
      audioParts: [...this.state.audioParts, { val: '' }]
    })
  }
  // 删除语音片段
  handleSliderDel = (index) => {
    const audioParts = [...this.state.audioParts]
    audioParts.splice(index, 1)
    this.setState({
      audioParts
    })
  }
  // 拖动sliderBar
  handleSliderChange = (val, index) => {
    const audioParts = [...this.state.audioParts]
    audioParts[index].val = val
    this.setState({
      audioParts: [...audioParts]
    })
  }
  // 获取总时长
  getDuring = ()=>{
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
          this.setState({ duration: innerAudioContext.duration })
          clearInterval(durationTimer)
          durationTimer = null
        }
      }, 1000)
    })
  }
  render () {
    return (
      <ScrollView
        scrollY
        scrollWithAnimation
        className='outContainer add'
      >
        <AtForm className='add-form'>
          {/*标题*/}
          <View className='add-module'>
            <View className='add-module_title'>标题</View>
            <AtInput
              className='add-module_input'
              name='value'
              type='text'
              placeholder='单行文本'
              value={this.state.title}
              onChange={this.handleTitleChange}
            />
          </View>
          {/*语音*/}
          <View className='add-module'>
            <View className='add-module_title'>语音</View>
            <View className='add-module_audioBox'>
              <AtButton className='add-module_audio' type='primary' size='small' circle onClick={this.handleAudioChange}>上传语音</AtButton>
              <Text>{this.state.filename}</Text>
            </View>
          </View>
          {/* 语音分段 */}
          <View className='add-module'>
            <View className='add-module_title'>语音分段</View>
            {
              this.state.audioParts.map((part, index) => {
                return (
                  <View className='add-module_sliderModule' key={index}>
                    <AtSlider
                      className='add-module_sliderBar'
                      step={1}
                      value={part.val || 0}
                      max={this.state.during}
                      activeColor='#4285F4'
                      backgroundColor='#BDBDBD'
                      blockColor='#4285F4'
                      blockSize={14}
                      showValue
                      onChanging={(event) => this.handleSliderChange(event, index)}
                    >
                    </AtSlider>
                    {/* <Table>{part.text}</Table> */}
                    <AtButton className='add-module_btn add-module_sliderDel' type='primary' size='small' circle onClick={() => this.handleSliderDel(index)}>删除</AtButton>
                  </View>
                )
              })
            }
            <AtButton className='add-module_btn add-module_sliderAdd' type='primary' size='small' circle onClick={this.handleSliderAdd}>新增</AtButton>
          </View>
          {/*封面图片*/}
          <View className='add-module'>
            <View className='add-module_title'>封面图片</View>
            <AtImagePicker
              className='add-module_img'
              files={this.state.files}
              onChange={this.handleFilesChange.bind(this)}
            />
          </View>
          {/*日语*/}
          <View className='add-module'>
            <View className='add-module_title'>日语</View>
            <AtTextarea
              className='add-module_textarea'
              count={false}
              value={this.state.jp}
              onChange={this.handleJpChange}
              maxLength={200}
              placeholder='请输入日文'
            />
          </View>
          {/*中文*/}
          <View className='add-module'>
            <View className='add-module_title'>中文</View>
            <AtTextarea
              className='add-module_textarea'
              count={false}
              value={this.state.cn}
              onChange={this.handleCnChange}
              maxLength={200}
              placeholder='请输入中文'
            />
          </View>
          <View className='add-formButtons'>
            <AtButton className='add-submit' type='primary' size='small' circle onClick={this.handleOnSubmit}>提交</AtButton>
            <AtButton className='add-reset' type='primary' size='small' circle onClick={this.handleOnReset}>重置</AtButton>
          </View>
        </AtForm>
      </ScrollView>
    )
  }
}

export default Index

