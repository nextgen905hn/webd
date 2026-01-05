import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
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
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState([]);
  const webViewRef = useRef(null);

  const generatedHTML = useMemo(() => {
    const errorList = [];
    
    // Validate HTML
    const unclosedTags = html.match(/<([a-z]+)[^>]*>/gi);
    const closedTags = html.match(/<\/([a-z]+)>/gi);
    if (unclosedTags && closedTags && unclosedTags.length !== closedTags.length) {
      errorList.push({ type: 'HTML', message: 'Possible unclosed HTML tags detected' });
    }

    // Validate CSS
    const openBraces = (css.match(/{/g) || []).length;
    const closeBraces = (css.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      errorList.push({ type: 'CSS', message: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing` });
    }

    // Check for common CSS errors
    if (css.includes(';;')) {
      errorList.push({ type: 'CSS', message: 'Double semicolons detected' });
    }

    setErrors(errorList);

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #fff; font-family: -apple-system, system-ui, sans-serif; }
    .error-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999;
      padding: 12px 16px;
      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
      border-bottom: 2px solid #ef4444;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .error-title {
      font-weight: 700;
      color: #991b1b;
      font-size: 14px;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .error-message {
      color: #dc2626;
      font-size: 13px;
      font-family: monospace;
      line-height: 1.5;
      margin-left: 24px;
    }
    .error-icon {
      font-size: 18px;
    }
    ${css}
  </style>
</head>
<body>
  ${html}
  <script>
    // Global error handler
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-container';
      errorDiv.innerHTML = \`
        <div class="error-title">
          <span class="error-icon">⚠️</span>
          JavaScript Error
        </div>
        <div class="error-message">
          <strong>Message:</strong> \${msg}<br>
          <strong>Line:</strong> \${lineNo}, <strong>Column:</strong> \${columnNo}
        </div>
      \`;
      document.body.insertBefore(errorDiv, document.body.firstChild);
      return false;
    };

    // Console error capture
    const originalError = console.error;
    console.error = function(...args) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-container';
      errorDiv.innerHTML = \`
        <div class="error-title">
          <span class="error-icon">🐛</span>
          Console Error
        </div>
        <div class="error-message">\${args.join(' ')}</div>
      \`;
      document.body.insertBefore(errorDiv, document.body.firstChild);
      originalError.apply(console, args);
    };

    try {
      ${js}
    } catch(e) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-container';
      errorDiv.innerHTML = \`
        <div class="error-title">
          <span class="error-icon">❌</span>
          JavaScript Execution Error
        </div>
        <div class="error-message">
          <strong>Error:</strong> \${e.message}<br>
          <strong>Type:</strong> \${e.name}
        </div>
      \`;
      document.body.insertBefore(errorDiv, document.body.firstChild);
    }
  </script>
</body>
</html>`;
  }, [html, css, js]);

  const handleRunCode = useCallback(() => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
    setShowPreview(true);
  }, []);

  const togglePreview = useCallback(() => {
    setShowPreview(prev => !prev);
  }, []);

  const getCurrentEditor = useCallback(() => {
    switch(activeTab) {
      case 'html': return { value: html, setValue: setHtml };
      case 'css': return { value: css, setValue: setCss };
      case 'js': return { value: js, setValue: setJs };
      default: return { value: html, setValue: setHtml };
    }
  }, [activeTab, html, css, js]);

  const { value, setValue } = getCurrentEditor();

  const tabs = useMemo(() => [
    { key: 'html', label: 'HTML', color: '#e34c26' },
    { key: 'css', label: 'CSS', color: '#264de4' },
    { key: 'js', label: 'JS', color: '#f0db4f' }
  ], []);

  return (
    <View style={styles.container}>
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
          {errors.length > 0 && !showPreview && (
            <View style={styles.errorBadge}>
              <Text style={styles.errorBadgeText}>{errors.length}</Text>
            </View>
          )}
          
          <TouchableOpacity 
            style={[styles.iconBtn, showPreview && styles.iconBtnActive]}
            onPress={togglePreview}
            activeOpacity={0.7}
          >
            <Text style={styles.iconText}>{showPreview ? '📝' : '👁'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.runBtn}
            onPress={handleRunCode}
            activeOpacity={0.8}
          >
            <Text style={styles.runIcon}>▶</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPreview ? (
        /* Full Screen Preview */
        <View style={styles.previewContainer}>
          <View style={styles.previewHeader}>
            <View style={styles.previewDots}>
              <View style={[styles.dot, styles.dotRed]} />
              <View style={[styles.dot, styles.dotYellow]} />
              <View style={[styles.dot, styles.dotGreen]} />
            </View>
            <Text style={styles.previewTitle}>Live Preview</Text>
            <TouchableOpacity onPress={togglePreview} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>
          <WebView
            ref={webViewRef}
            originWhitelist={['*']}
            source={{ html: generatedHTML }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            cacheEnabled={false}
          />
        </View>
      ) : (
        /* Code Editor */
        <>
          {/* Tab Bar */}
          <View style={styles.tabBar}>
            {tabs.map(tab => (
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

          {/* Code Input */}
          <View style={styles.editorContainer}>
            {/* Error Panel */}
         

            <TextInput
              style={styles.codeInput}
              value={value}
              onChangeText={setValue}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
              textAlignVertical="top"
              placeholder={`Enter ${activeTab.toUpperCase()} code...`}
              placeholderTextColor="#6e7681"
            />
          </View>
        </>
      )}
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  header: {
    marginTop:10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#161b22',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
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
  iconBtnActive: {
    backgroundColor: '#6366f1',
  },
  iconText: {
    fontSize: 16,
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
    flexDirection: 'row',
    backgroundColor: '#0d1117',
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
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
  codeInput: {
    flex: 1,
    padding: 16,
    color: '#c9d1d9',
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: 50,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dotRed: {
    backgroundColor: '#ff5f56',
  },
  dotYellow: {
    backgroundColor: '#ffbd2e',
  },
  dotGreen: {
    backgroundColor: '#27c93f',
  },
  previewTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#57606a',
    letterSpacing: 0.3,
    flex: 1,
    textAlign: 'center',
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e1e4e8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#57606a',
    fontSize: 14,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#161b22',
  },
  errorBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  errorPanel: {
    backgroundColor: '#2d1b1b',
    borderBottomWidth: 1,
    borderBottomColor: '#ef4444',
    maxHeight: 150,
  },
  errorPanelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1a0f0f',
    borderBottomWidth: 1,
    borderBottomColor: '#ef4444',
  },
  errorPanelTitle: {
    color: '#fca5a5',
    fontSize: 13,
    fontWeight: '700',
  },
  errorItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#3f1f1f',
  },
  errorType: {
    color: '#fca5a5',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  errorMessage: {
    color: '#fecaca',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});

export default CodeEditor;