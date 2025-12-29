import React, { Component, PropsWithChildren } from 'react'
import { View } from '@tarojs/components'
import './app.css'

class App extends Component<PropsWithChildren> {

    componentDidMount() { }

    componentDidShow() { }

    componentDidHide() { }

    // this.props.children 是将要会渲染的页面
    render() {
        return this.props.children
    }
}

export default App
