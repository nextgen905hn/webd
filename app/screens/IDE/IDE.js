import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';

const CodeEditor = () => {
  const [html, setHtml] = useState('<div class="container">\n  <h1>Hello World!</h1>\n  <p>Start coding...</p>\n</div>');
  const [css, setCss] = useState('.container {\n  padding: 20px;\n  font-family: -apple-system, sans-serif;\n}\n\nh1 {\n  color: #6366f1;\n  font-size: 32px;\n  margin-bottom: 16px;\n}');
  const [js, setJs] = useState('console.log("Ready to code!");');
  const [activeTab, setActiveTab] = useState('html');
  const [showPreview, setShowPreview] = useState(true);
  const [lineNumbers, setLineNumbers] = useState(true);
  const webViewRef = useRef(null);

  const generateHTML = () => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    try {
      ${js}
    } catch(e) {
      document.body.innerHTML += '<div style="color: #ef4444; padding: 12px; background: #fee; margin: 12px; border-radius: 8px; font-family: monospace; font-size: 14px;"><strong>Error:</strong> ' + e.message + '</div>';
    }
  </script>
</body>
</html>
    `;
  };

  const getLineNumbers = (code) => {
    const lines = code.split('\n').length;
    return Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  };

  const renderEditor = () => {
    let value, setValue;
    
    switch(activeTab) {
      case 'html':
        value = html;
        setValue = setHtml;
        break;
      case 'css':
        value = css;
        setValue = setCss;
        break;
      case 'js':
        value = js;
        setValue = setJs;
        break;
    }

    return (
      <View style={styles.editorWrapper}>
        {lineNumbers && (
          <View style={styles.lineNumbers}>
            <Text style={styles.lineNumberText}>
              {getLineNumbers(value)}
            </Text>
          </View>
        )}
        <ScrollView 
          style={styles.editorScroll}
          showsVerticalScrollIndicator={false}
        >
          <TextInput
            style={styles.codeInput}
            value={value}
            onChangeText={setValue}
            multiline
            autoCapitalize="none"
            autoCorrect={false}
            spellCheck={false}
            keyboardType="default"
            scrollEnabled={false}
          />
        </ScrollView>
      </View>
    );
  };

  const runCode = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0d1117" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>{'</>'}</Text>
          </View>
          <Text style={styles.headerTitle}>CodeSpace</Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setLineNumbers(!lineNumbers)}
          >
            <Text style={styles.iconText}>#</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconBtn}
            onPress={() => setShowPreview(!showPreview)}
          >
            <Text style={styles.iconText}>👁</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.runBtn}
            onPress={runCode}
          >
            <Text style={styles.runIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <View style={styles.tabsContainer}>
          {[
            { key: 'html', label: 'HTML', color: '#e34c26' },
            { key: 'css', label: 'CSS', color: '#264de4' },
            { key: 'js', label: 'JS', color: '#f0db4f' }
          ].map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabDot, { backgroundColor: tab.color }]} />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
              {activeTab === tab.key && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Editor Section */}
      <View style={styles.editorContainer}>
        {renderEditor()}
      </View>

      {/* Preview Section */}
      {showPreview && (
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <View style={styles.previewDots}>
              <View style={[styles.dot, { backgroundColor: '#ff5f56' }]} />
              <View style={[styles.dot, { backgroundColor: '#ffbd2e' }]} />
              <View style={[styles.dot, { backgroundColor: '#27c93f' }]} />
            </View>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewDots} />
          </View>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: generateHTML() }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
    marginTop: 5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#21262d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 16,
    color: '#8b949e',
  },
  runBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#238636',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  runIcon: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 2,
  },
  tabBar: {
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: '#161b22',
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabText: {
    color: '#8b949e',
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.3,
  },
  activeTabText: {
    color: '#fff',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#6366f1',
  },
  editorContainer: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  editorWrapper: {
    flex: 1,
    flexDirection: 'row',
  },
  lineNumbers: {
    backgroundColor: '#161b22',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#21262d',
  },
  lineNumberText: {
    color: '#6e7681',
    fontSize: 13,
    fontFamily: 'monospace',
    lineHeight: 20,
    textAlign: 'right',
  },
  editorScroll: {
    flex: 1,
  },
  codeInput: {
    flex: 1,
    padding: 16,
    color: '#c9d1d9',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
    textAlignVertical: 'top',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopWidth: 2,
    borderTopColor: '#21262d',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f6f8fa',
    borderBottomWidth: 1,
    borderBottomColor: '#d0d7de',
  },
  previewDots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606a',
    letterSpacing: 0.3,
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
});

export default CodeEditor;