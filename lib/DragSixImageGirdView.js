import React, { Component } from 'react'
import { Animated, Dimensions, Easing, PanResponder, StyleSheet, TouchableOpacity, View } from 'react-native'
import _ from "lodash";

const PropTypes = require('prop-types')
const { width, height } = Dimensions.get('window')

const sortRefs = new Map()
const animMaps = new Map()
const measureDelay = 100
const defaultZIndex = 8
const touchZIndex = 99
const firstImageScale = 0.45
const otherImageScale = 0.9
const minOpacity = 0.8
const scaleDuration = 50
const slideDuration = 300

export default class DragSixImageGirdView extends Component {


  componentWillMount() {
    this._panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => true,
      onStartShouldSetPanResponderCapture: (evt, gestureState) => {
        this.isMovePanResponder = false
        return false
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => this.isMovePanResponder,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => this.isMovePanResponder,

      onPanResponderGrant: (evt, gestureState) => {
      },
      onPanResponderMove: (evt, gestureState) => this.moveTouch(evt, gestureState),
      onPanResponderRelease: (evt, gestureState) => this.endTouch(evt),

      onPanResponderTerminationRequest: (evt, gestureState) => false,
      onShouldBlockNativeResponder: (evt, gestureState) => false,
    })
  }

  constructor(props) {
    super()

    this.itemWidth = props.childrenWidth + props.marginChildrenLeft + props.marginChildrenRight
    this.itemHeight = props.childrenHeight + props.marginChildrenTop + props.marginChildrenBottom

    this.firstItemWidth = props.childrenWidth * 2 + props.marginChildrenLeft + props.marginChildrenRight
    this.firstItemHeight = props.childrenHeight * 2 + props.marginChildrenLeft + props.marginChildrenRight
    this.reComplexDataSource(true, props)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dataSource != nextProps.dataSource) {
      this.reComplexDataSource(false, nextProps)
    }
  }

  startTouch(touchIndex) {

    //防止拖动
    const fixedItems = this.props.fixedItems;
    if (fixedItems.length > 0 && fixedItems.includes(touchIndex)) {
      return;
    }

    this.isHasMove = false

    if (!this.props.sortable) return

    if (sortRefs.has(touchIndex)) {
      if (this.props.onDragStart) {
        this.props.onDragStart(touchIndex)
      }
      Animated.timing(
        this.state.dataSource[touchIndex].scaleValue,
        {
          toValue: this.getScale(touchIndex),
          duration: scaleDuration,
        }
      ).start(() => {
        this.touchCurItem = {
          ref: sortRefs.get(touchIndex),
          index: touchIndex,
          originLeft: this.state.dataSource[touchIndex].originLeft,
          itemWidth: this.state.dataSource[touchIndex].itemWidth,
          originTop: this.state.dataSource[touchIndex].originTop,
          moveToIndex: touchIndex,
        }
        this.isMovePanResponder = true
      })
    }
  }

  getScale = (touchIndex) => {
    return touchIndex === 0 ? firstImageScale : otherImageScale
  }

  moveTouch(nativeEvent, gestureState) {

    this.isHasMove = true

    if (this.touchCurItem) {

      let dx = gestureState.dx
      let dy = gestureState.dy

      const rowNum = parseInt(this.props.parentWidth / this.itemWidth);   //3
      let smallImageOffset = (this.itemWidth * (1 - otherImageScale)) / 2      //边界偏移量计算，因为大小图片都要做缩放动画，边界计算都用缩放到最小图的缩放来计算

      const maxWidth = this.props.parentWidth - this.itemWidth + smallImageOffset
      const maxHeight = this.props.parentWidth - this.itemWidth + smallImageOffset

      let offsetW = (this.touchCurItem.itemWidth * (1 - this.getScale(this.touchCurItem.index))) / 2
      let offsetH = (this.touchCurItem.itemWidth * (1 - this.getScale(this.touchCurItem.index))) / 2

      //出界后取最大或最小值
      if (this.touchCurItem.originLeft + dx + offsetW < 0) {
        dx = -this.touchCurItem.originLeft - offsetW
      } else if (this.touchCurItem.originLeft + dx + offsetW > maxWidth) {
        dx = maxWidth - this.touchCurItem.originLeft - offsetW
      }
      if (this.touchCurItem.originTop + dy + offsetH < 0) {
        dy = -this.touchCurItem.originTop - offsetH
      } else if (this.touchCurItem.originTop + dy + offsetH > maxHeight) {
        dy = maxHeight - this.touchCurItem.originTop - offsetH
      }

      let left = this.touchCurItem.originLeft + dx
      let top = this.touchCurItem.originTop + dy

      this.touchCurItem.ref.setNativeProps({
        style: {
          zIndex: touchZIndex,
        }
      })

      this.state.dataSource[this.touchCurItem.index].position.setValue({
        x: left,
        y: top,
      })

      let moveToIndex = 0

      let gestureX = gestureState.dx + this.touchCurItem.originLeft + this.touchCurItem.itemWidth / 2
      let gestureY = gestureState.dy + this.touchCurItem.originTop + this.touchCurItem.itemWidth / 2

      if (gestureX < this.itemWidth * 2 && gestureY < this.itemHeight * 2) {
        moveToIndex = 0
      } else if (gestureX > this.itemWidth * 2 && gestureY < this.itemHeight) {
        moveToIndex = 1
      } else if (gestureX > this.itemWidth * 2 && gestureY < this.itemHeight * 2) {
        moveToIndex = 2
      } else if (gestureX < this.itemWidth && gestureY > this.itemHeight * 2) {
        moveToIndex = 3
      } else if (gestureX > this.itemWidth && gestureX < this.itemWidth * 2 && gestureY > this.itemHeight * 2) {
        moveToIndex = 4
      } else if (gestureX > this.itemWidth * 2 && gestureY > this.itemHeight * 2) {
        moveToIndex = 5
      } else {
        moveToIndex = 0
      }

      if (moveToIndex > this.dataLength - 1) moveToIndex = 0

      if (this.touchCurItem.moveToIndex != moveToIndex) {
        const fixedItems = this.props.fixedItems;
        if (fixedItems.length > 0 && fixedItems.includes(moveToIndex)) return;
        this.touchCurItem.moveToIndex = moveToIndex

        this.state.dataSource.forEach((item, index) => {

          let nextItem = null
          if (index > this.touchCurItem.index && index <= moveToIndex) {
            nextItem = this.state.dataSource[index - 1]

          } else if (index >= moveToIndex && index < this.touchCurItem.index) {
            nextItem = this.state.dataSource[index + 1]

          } else if (index != this.touchCurItem.index &&
            (item.position.x._value != item.originLeft ||
              item.position.y._value != item.originTop)) {
            nextItem = this.state.dataSource[index]

          } else if ((this.touchCurItem.index - moveToIndex > 0 && moveToIndex == index + 1) ||
            (this.touchCurItem.index - moveToIndex < 0 && moveToIndex == index - 1)) {
            nextItem = this.state.dataSource[index]
          }

          if (nextItem != null) {
            if (moveToIndex === 0 && index === 0) {
              //移动到第一个的，第一个图片的缩放处理和位置处理
              Animated.timing(
                item.position,
                {
                  toValue: { x: 3 * this.itemWidth / 2, y: -this.itemWidth / 2 },
                  duration: slideDuration,
                  easing: Easing.out(Easing.quad),
                }
              ).start()
              console.log("nextItem--->", item.scaleValue)
              Animated.timing(
                item.scaleValue,
                {
                  toValue: 0.5,
                  duration: slideDuration,
                  easing: Easing.out(Easing.quad),
                }
              ).start()
            } else {
              Animated.timing(
                item.position,
                {
                  toValue: { x: parseInt(nextItem.originLeft + 0.5), y: parseInt(nextItem.originTop + 0.5) },
                  duration: slideDuration,
                  easing: Easing.out(Easing.quad),
                }
              ).start()
            }
          }

        })
      }

    }
  }

  getDataLength(data) {
    let length = 0
    _.each(data, (item) => {
      if (!_.isEmpty(item.imgUrl)) {
        length = length + 1;
      }
    })
    return length
  }

  endTouch(nativeEvent) {

    //clear
    if (this.touchCurItem) {
      if (this.props.onDragEnd) {
        this.props.onDragEnd(this.touchCurItem.index, this.touchCurItem.moveToIndex)
      }
      Animated.timing(
        this.state.dataSource[this.touchCurItem.index].scaleValue,
        {
          toValue: 1,
          duration: scaleDuration,
        }
      ).start()
      //if(this.touchCurItem.moveToIndex===0){
        //移动到第一个的，第一个图片的缩放处理
        Animated.timing(
          this.state.dataSource[0].scaleValue,
          {
            toValue: 1,
            duration: scaleDuration,
          }
        ).start()
     // }
      this.touchCurItem.ref.setNativeProps({
        style: {
          zIndex: defaultZIndex,
        }
      })
      this.changePosition(this.touchCurItem.index, this.touchCurItem.moveToIndex)
      this.touchCurItem = null
    }
  }

  onPressOut() {
    this.isScaleRecovery = setTimeout(() => {
      if (this.isMovePanResponder && !this.isHasMove) {
        this.endTouch()
      }
    }, 220)
  }

  changePosition(startIndex, endIndex) {

    if (startIndex == endIndex) {
      const curItem = this.state.dataSource[startIndex]
      this.state.dataSource[startIndex].position.setValue({
        x: parseInt(curItem.originLeft + 0.5),
        y: parseInt(curItem.originTop + 0.5),
      })
      return;
    }

    let isCommon = true
    if (startIndex > endIndex) {
      isCommon = false
      let tempIndex = startIndex
      startIndex = endIndex
      endIndex = tempIndex
    }

    const newDataSource = [...this.state.dataSource].map((item, index) => {
      let newIndex = null
      if (isCommon) {
        if (endIndex > index && index >= startIndex) {
          newIndex = index + 1
        } else if (endIndex == index) {
          newIndex = startIndex
        }
      } else {
        if (endIndex >= index && index > startIndex) {
          newIndex = index - 1
        } else if (startIndex == index) {
          newIndex = endIndex
        }
      }

      if (newIndex != null) {
        const newItem = { ...this.state.dataSource[newIndex] }
        newItem.originLeft = item.originLeft
        newItem.itemWidth = item.itemWidth
        newItem.originTop = item.originTop
        newItem.position = new Animated.ValueXY({
          x: parseInt(item.originLeft + 0.5),
          y: parseInt(item.originTop + 0.5),
        })
        item = newItem
      }

      return item
    })

    this.setState({
      dataSource: newDataSource
    }, () => {
      if (this.props.onDataChange) {
        this.props.onDataChange(this.getOriginalData())
      }
      //防止RN不绘制开头和结尾
      const startItem = this.state.dataSource[startIndex]
      this.state.dataSource[startIndex].position.setValue({
        x: parseInt(startItem.originLeft + 0.5),
        y: parseInt(startItem.originTop + 0.5),
      })
      const endItem = this.state.dataSource[endIndex]
      this.state.dataSource[endIndex].position.setValue({
        x: parseInt(endItem.originLeft + 0.5),
        y: parseInt(endItem.originTop + 0.5),
      })
    })

  }

  reComplexDataSource(isInit, props) {
    const rowNum = parseInt(props.parentWidth / this.itemWidth);
    this.dataLength = this.getDataLength(props.dataSource)
    const dataSource = props.dataSource.map((item, index) => {
      const newData = {}
      let left = 0
      if (index === 0 || index == 3) {
        left = 0
      } else if (index === 1 || index === 2 || index == 5) {
        left = this.itemWidth * 2
      } else if (index == 4) {
        left = this.itemWidth
      }
      let top = 0
      if (index === 0 || index == 1) {
        top = 0
      } else if (index === 3 || index === 4 || index == 5) {
        top = this.itemHeight * 2
      } else if (index == 2) {
        top = this.itemHeight
      }

      if (index === 0) {
        newData.itemWidth = this.firstItemWidth
      } else {
        newData.itemWidth = this.itemWidth
      }

      newData.data = item
      newData.originIndex = index
      newData.originLeft = left
      newData.originTop = top
      newData.position = new Animated.ValueXY({
        x: parseInt(left + 0.5),
        y: parseInt(top + 0.5),
      })
      newData.scaleValue = new Animated.Value(1)
      return newData
    })

    if (isInit) {
      this.state = {
        dataSource: dataSource,
        height: this.firstItemHeight + this.itemHeight
      }
    } else {
      this.setState({
        dataSource: dataSource,
        height: this.firstItemHeight + this.itemHeight
      })
    }

  }

  getOriginalData() {
    return this.state.dataSource.map((item, index) => item.data)
  }

  render() {
    return (
      <View
        style={ [styles.container, {
          width: this.props.parentWidth,
          height: this.state.height,
        }] }
      >
        {
          this.state.dataSource.map((item, index) => {
            const transformObj = {}
            transformObj[this.props.scaleStatus] = item.scaleValue
            return (
              <Animated.View
                key={ item.originIndex }
                ref={ (ref) => sortRefs.set(index, ref) }
                { ...this._panResponder.panHandlers }
                style={ [styles.item, {
                  marginTop: this.props.marginChildrenTop,
                  marginBottom: this.props.marginChildrenBottom,
                  marginLeft: this.props.marginChildrenLeft,
                  marginRight: this.props.marginChildrenRight,
                  left: item.position.x,
                  top: item.position.y,
                  transform: [transformObj]
                }] }>
                <TouchableOpacity
                  activeOpacity={ 1 }
                  onPressOut={ () => this.onPressOut() }
                  onLongPress={ _.isEmpty(item.data.imgUrl) ? "" : () => this.startTouch(index) }
                  onPress={ () => {
                    if (this.props.onClickItem) {
                      this.props.onClickItem(this.getOriginalData(), item.data, index)
                    }
                  } }>
                  { this.props.renderItem(item.data, index) }
                </TouchableOpacity>
              </Animated.View>
            )
          })
        }
      </View>
    )
  }

  componentWillUnmount() {
    if (this.isScaleRecovery) clearTimeout(this.isScaleRecovery)
  }

}

DragSixImageGirdView.propsTypes = {
  dataSource: PropTypes.array.isRequired,
  parentWidth: PropTypes.number,
  childrenHeight: PropTypes.number.isRequired,
  childrenWidth: PropTypes.number.isRequired,

  marginChildrenTop: PropTypes.number,
  marginChildrenBottom: PropTypes.number,
  marginChildrenLeft: PropTypes.number,
  marginChildrenRight: PropTypes.number,

  sortable: PropTypes.bool,

  onClickItem: PropTypes.func,
  onDragStart: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDataChange: PropTypes.func,
  renderItem: PropTypes.func.isRequired,
  scaleStatus: PropTypes.oneOf('scale', 'scaleX', 'scaleY'),
  fixedItems: PropTypes.array
}

DragSixImageGirdView.defaultProps = {
  marginChildrenTop: 0,
  marginChildrenBottom: 0,
  marginChildrenLeft: 0,
  marginChildrenRight: 0,
  parentWidth: width,
  sortable: true,
  scaleStatus: 'scale',
  fixedItems: []
}

const styles = StyleSheet.create({
  container: {
    flexWrap: 'wrap',
    flexDirection: 'row',
  },
  item: {
    position: 'absolute',
    zIndex: defaultZIndex,
  },
})
