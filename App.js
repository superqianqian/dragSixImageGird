/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import {
  StyleSheet,
  View,
  Dimensions,
  Image
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import DragSixImageGirdView from './lib/DragSixImageGirdView';
import React, { Component } from 'react';
import AddSvgComponent from './lib/AddSvgComponent';
import _ from "lodash";

const parentWidth= Dimensions.get('window').width-1
const TEST_DATA = [
  { imgUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2436382371,1686142523&fm=27&gp=0.jpg' },
  { imgUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=1785199001,3375299815&fm=27&gp=0.jpg' },
  { imgUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2052084101,3197676643&fm=27&gp=0.jpg' },
  { imgUrl: 'https://ss0.bdstatic.com/70cFvHSh_Q1YnxGkpoWK1HF6hhy/it/u=1923368568,3957327670&fm=27&gp=0.jpg' },
  { imgUrl: 'https://ss2.bdstatic.com/70cFvnSh_Q1YnxGkpoWK1HF6hhy/it/u=2758807304,2560528048&fm=27&gp=0.jpg' },
  { imgUrl: 'https://ss1.bdstatic.com/70cFuXSh_Q1YnxGkpoWK1HF6hhy/it/u=3297261154,2231661797&fm=27&gp=0.jpg' },
]

class App extends Component  {

  render(){
    return (
      <View style={styles.container}>
        <DragSixImageGirdView
          dataSource={ TEST_DATA }
          parentWidth={ parentWidth }
          childrenWidth={ parentWidth / 3 }
          childrenHeight={ parentWidth / 3 }
          scaleStatus={ 'scale' }
          onClickItem={ (data, item, index) => {
          } }
          renderItem={ (item, index) => {
            return this.renderImageItem(item, index)
          } }
        />
      </View>
    );
  }

  renderImageItem=(item, index) =>{
    if (index === 0) {
      return (
        <View style={ styles.item }>
          {
            _.isEmpty(item.imgUrl) ? <View style={ styles.item_icon }>
                <AddSvgComponent color={ "#A9A9A9" }/>
              </View> :
              <Image
                style={ styles.first_item_icon }
                source={ { uri: item.imgUrl } }
              />
          }
        </View>
      )
    } else {
      return (
        <View style={ styles.item }>
          {
            _.isEmpty(item.imgUrl) ? <View style={ styles.item_icon }>
                <Image
                  style={ styles.item_icon }
                  source={ { uri: "https://ss0.bdstatic.com/70cFuHSh_Q1YnxGkpoWK1HF6hhy/it/u=3281196885,1779237671&fm=27&gp=0.jpg" } }
                />

              </View> :
              <Image
                style={ styles.item_icon }
                source={ { uri: item.imgUrl } }
              />
          }
        </View>
      )
    }
  }

};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lighter,
    flex:1
  },
  item_icon: {
    width: parentWidth / 3,
    height: parentWidth / 3,
    resizeMode: 'cover',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderColor:"#fff",
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: 'center',
    margin: 0.5,
  },
  first_item_icon: {
    width: 2 * parentWidth / 3,
    height: 2 * parentWidth / 3,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    alignItems: "center",
    borderColor:"#fff",
    justifyContent: 'center',
    margin: 0.5,
    backgroundColor: "#f0f0f0",
    resizeMode: 'cover',
  },
});

export default App;
