import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Circle } from "react-native-svg";

export default function CertificateCard({
  name,
  course,
  date,
  certId,
  width,
  height,
}) {

  // Scale factor based on width (1000 = base width)
  const scale = width / 1000;
  const strokeWidth = 24 * scale;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Animated Background Pattern */}
      <View style={[styles.bgContainer]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor="#f8fafc" />
              <Stop offset="0.5" stopColor="#f1f5f9" />
              <Stop offset="1" stopColor="#e2e8f0" />
            </LinearGradient>
          </Defs>
          <Rect width={width} height={height} fill="url(#bgGrad)" />
          
          {/* Decorative Circles */}
          <Circle cx={width * 0.1} cy={height * 0.15} r={60 * scale} fill="#8E2DE2" opacity={0.03} />
          <Circle cx={width * 0.9} cy={height * 0.2} r={80 * scale} fill="#4A00E0" opacity={0.04} />
          <Circle cx={width * 0.85} cy={height * 0.85} r={100 * scale} fill="#00C6FF" opacity={0.05} />
          <Circle cx={width * 0.15} cy={height * 0.9} r={70 * scale} fill="#8E2DE2" opacity={0.04} />
        </Svg>
      </View>

      {/* Premium Gradient Border */}
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="edgeGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#8E2DE2" stopOpacity={0.9} />
            <Stop offset="0.3" stopColor="#4A00E0" />
            <Stop offset="0.7" stopColor="#6366F1" />
            <Stop offset="1" stopColor="#00C6FF" stopOpacity={0.7} />
          </LinearGradient>
        </Defs>
        <Rect
          x={strokeWidth / 2}
          y={strokeWidth / 2}
          rx={28 * scale}
          ry={28 * scale}
          width={width - strokeWidth}
          height={height - strokeWidth}
          fill="none"
          stroke="url(#edgeGrad)"
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
        />
      </Svg>

      {/* Inner Card Content */}
      <View style={[styles.card, { 
        margin: 40 * scale, 
        padding: 44 * scale,
        borderRadius: 20 * scale,
        borderWidth: 4 * scale,
        borderColor: '#8E2DE2',
      }]}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={[styles.badge, { 
            paddingVertical: 10 * scale, 
            paddingHorizontal: 20 * scale,
            borderRadius: 20 * scale,
          }]}>
            <Text style={[styles.badgeText, { fontSize: 16 * scale }]}>
              ✨ OFFICIAL CERTIFICATE
            </Text>
          </View>
          
          <Text style={[styles.certTitle, { 
            fontSize: 48 * scale, 
            marginTop: 20 * scale,
            lineHeight: 56 * scale,
          }]}>
            Certificate of Achievement
          </Text>
          
          <View style={[styles.divider, { 
            width: 80 * scale, 
            height: 4 * scale,
            borderRadius: 2 * scale,
            marginVertical: 20 * scale,
          }]} />
        </View>

        {/* Main Content */}
        <View style={styles.contentSection}>
          <Text style={[styles.small, { fontSize: 18 * scale }]}>
            This certifies that
          </Text>
          
          <Text style={[styles.name, { 
            fontSize: 42 * scale, 
            marginTop: 16 * scale,
            lineHeight: 50 * scale,
          }]}>
            {name}
          </Text>
          
          <Text style={[styles.small, { 
            fontSize: 18 * scale, 
            marginTop: 20 * scale,
          }]}>
            has successfully completed
          </Text>
          
          <View style={[styles.courseTag, {
            marginTop: 16 * scale,
            paddingVertical: 16 * scale,
            paddingHorizontal: 28 * scale,
            borderRadius: 16 * scale,
          }]}>
            <Text style={[styles.course, { fontSize: 26 * scale }]}>
              {course}
            </Text>
          </View>

          {/* Achievement Icons */}
          <View style={[styles.achievementRow, { 
            marginTop: 28 * scale,
            gap: 16 * scale,
          }]}>
            <View style={[styles.achievementBadge, {
              width: 56 * scale,
              height: 56 * scale,
              borderRadius: 14 * scale,
            }]}>
              <Text style={[styles.achievementIcon, { fontSize: 28 * scale }]}>
                🎓
              </Text>
            </View>
            <View style={[styles.achievementBadge, {
              width: 56 * scale,
              height: 56 * scale,
              borderRadius: 14 * scale,
            }]}>
              <Text style={[styles.achievementIcon, { fontSize: 28 * scale }]}>
                🏆
              </Text>
            </View>
            <View style={[styles.achievementBadge, {
              width: 56 * scale,
              height: 56 * scale,
              borderRadius: 14 * scale,
            }]}>
              <Text style={[styles.achievementIcon, { fontSize: 28 * scale }]}>
                ⭐
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Section */}
        <View style={[styles.footerSection, { marginTop: 28 * scale }]}>
          {/* Meta Info */}
          <View style={[styles.metaRow, { marginBottom: 24 * scale }]}>
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { fontSize: 13 * scale }]}>
                ISSUED ON
              </Text>
              <Text style={[styles.metaValue, { fontSize: 16 * scale }]}>
                {date}
              </Text>
            </View>
            
            <View style={[styles.separator, { 
              width: 2 * scale, 
              height: 36 * scale,
            }]} />
            
            <View style={styles.metaItem}>
              <Text style={[styles.metaLabel, { fontSize: 13 * scale }]}>
                CERTIFICATE ID
              </Text>
              <Text style={[styles.metaValue, { fontSize: 16 * scale }]}>
                {certId}
              </Text>
            </View>
          </View>

          {/* Signature Row */}
          <View style={[styles.signatureRow, { marginBottom: 20 * scale }]}>
            <View style={styles.signatureBlock}>
                <Text style={[styles.signatureText, { 
                  fontSize: 48 * scale, 
                  fontFamily: "Pacifico-Regular",
                  lineHeight: 48 * scale,
                }]}>
                  Saad
                </Text>
            
              <View style={[styles.signatureLine, { 
                width: 140 * scale, 
                height: 2 * scale,
                marginTop: 10 * scale,
              }]} />
              <Text style={[styles.signatureLabel, { 
                fontSize: 14 * scale,
                marginTop: 8 * scale,
              }]}>
                Chief Instructor
              </Text>
            </View>

            <View style={styles.logoBlock}>
              <View style={[styles.logoCircle, { 
                width: 76 * scale, 
                height: 76 * scale, 
                borderRadius: 18 * scale,
              }]}>
                <Text style={[styles.logoText, { fontSize: 30 * scale }]}>
                  PL
                </Text>
              </View>
              <Text style={[styles.logoLabel, { 
                fontSize: 14 * scale,
                marginTop: 10 * scale,
              }]}>
                Pro Learning
              </Text>
            </View>
          </View>

          {/* Verification Section */}
          <View style={[styles.verifySection, {
            paddingVertical: 12 * scale,
            paddingHorizontal: 20 * scale,
            borderRadius: 12 * scale,
          }]}>
            <Text style={[styles.verifyText, { fontSize: 13 * scale }]}>
              🔒 Verify authenticity at: prolearning.com/verify/{certId}
            </Text>
          </View>
        </View>
      </View>

      {/* Corner Accent */}
      <View style={[styles.cornerAccent, { 
        width: 120 * scale, 
        height: 120 * scale,
        borderTopLeftRadius: 28 * scale,
      }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 28,
    backgroundColor: "#f8fafc",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#8E2DE2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
  },
  headerSection: {
    width: "100%",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "#f0f9ff",
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  badgeText: {
    color: "#0369a1",
    fontWeight: "800",
    letterSpacing: 1,
  },
  certTitle: {
    fontWeight: "900",
    color: "#0f172a",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  divider: {
    backgroundColor: "#8E2DE2",
  },
  contentSection: {
    width: "100%",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  small: {
    color: "#64748b",
    fontWeight: "500",
    textAlign: "center",
  },
  name: {
    fontWeight: "900",
    color: "#1e293b",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  courseTag: {
    backgroundColor: "#f5f3ff",
    borderWidth: 2,
    borderColor: "#8E2DE2",
  },
  course: {
    fontWeight: "800",
    color: "#5b21b6",
    textAlign: "center",
  },
  achievementRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  achievementBadge: {
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fbbf24",
  },
  achievementIcon: {
    textAlign: "center",
  },
  footerSection: {
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
  },
  metaItem: {
    alignItems: "center",
    flex: 1,
  },
  separator: {
    backgroundColor: "#e2e8f0",
  },
  metaLabel: {
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  metaValue: {
    color: "#475569",
    fontWeight: "700",
  },
  signatureRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  signatureBlock: {
    alignItems: "flex-start",
  },
  signatureText: {
    color: "#8E2DE2",
  },
  signatureFallback: {
    color: "#8E2DE2",
    fontStyle: "italic",
    fontWeight: "700",
  },
  signatureLine: {
    backgroundColor: "#cbd5e1",
  },
  signatureLabel: {
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  logoBlock: {
    alignItems: "center",
  },
  logoCircle: {
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#8E2DE2",
  },
  logoText: {
    color: "#5b21b6",
    fontWeight: "900",
    letterSpacing: -1,
  },
  logoLabel: {
    color: "#64748b",
    fontWeight: "700",
  },
  verifySection: {
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  verifyText: {
    color: "#64748b",
    fontWeight: "600",
    textAlign: "center",
  },
  cornerAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    backgroundColor: "#8E2DE2",
    opacity: 0.03,
  },
});