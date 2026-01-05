import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Line } from "react-native-svg";

export default function CertificateCard({
  name,
  course,
  date,
  certId,
  width,
  height,
}) {
  const scale = width / 1000;

  return (
    <View style={[styles.container, { width, height }]}>
      {/* Clean Background */}
      <View style={[styles.bgContainer]}>
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Rect width={width} height={height} fill="#ffffff" />
          
          {/* Elegant Border Frame */}
          <Rect
            x={60 * scale}
            y={60 * scale}
            width={width - 120 * scale}
            height={height - 120 * scale}
            fill="none"
            stroke="#1a365d"
            strokeWidth={3 * scale}
          />
          <Rect
            x={68 * scale}
            y={68 * scale}
            width={width - 136 * scale}
            height={height - 136 * scale}
            fill="none"
            stroke="#1a365d"
            strokeWidth={1 * scale}
          />
          
          {/* Corner Ornaments */}
          {[
            { x: 80 * scale, y: 80 * scale, rotate: 0 },
            { x: width - 80 * scale, y: 80 * scale, rotate: 90 },
            { x: 80 * scale, y: height - 80 * scale, rotate: 270 },
            { x: width - 80 * scale, y: height - 80 * scale, rotate: 180 },
          ].map((corner, i) => (
            <Path
              key={i}
              d={`M ${corner.x} ${corner.y} l ${20 * scale} 0 M ${corner.x} ${corner.y} l 0 ${20 * scale}`}
              stroke="#2563eb"
              strokeWidth={2 * scale}
              strokeLinecap="round"
              transform={`rotate(${corner.rotate} ${corner.x} ${corner.y})`}
            />
          ))}
        </Svg>
      </View>

      {/* Content */}
      <View style={[styles.content, { 
        paddingHorizontal: 100 * scale,
        paddingVertical: 80 * scale,
      }]}>
        {/* Header */}
        <View style={styles.header}>
          {/* Logo/Seal */}
          <View style={[styles.seal, {
            width: 80 * scale,
            height: 80 * scale,
            borderRadius: 40 * scale,
            borderWidth: 3 * scale,
          }]}>
            <Text style={[styles.sealText, { fontSize: 28 * scale }]}>WD</Text>
          </View>
          
          <Text style={[styles.institution, { 
            fontSize: 22 * scale,
            marginTop: 16 * scale,
          }]}>
            Web Development Academy
          </Text>
          
          <Text style={[styles.tagline, { 
            fontSize: 13 * scale,
            marginTop: 6 * scale,
          }]}>
            EXCELLENCE IN EDUCATION
          </Text>
        </View>

        {/* Title */}
        <View style={[styles.titleSection, { marginTop: 40 * scale }]}>
          <Text style={[styles.certType, { fontSize: 15 * scale }]}>
            CERTIFICATE OF COMPLETION
          </Text>
          
          <Svg width={120 * scale} height={3 * scale} style={{ marginVertical: 16 * scale }}>
            <Line
              x1="0"
              y1="1.5"
              x2={120 * scale}
              y2="1.5"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </Svg>
        </View>

        {/* Body */}
        <View style={[styles.body, { marginTop: 30 * scale }]}>
          <Text style={[styles.bodyText, { fontSize: 16 * scale }]}>
            This is to certify that
          </Text>
          
          <Text style={[styles.recipientName, { 
            fontSize: 40 * scale,
            marginTop: 20 * scale,
            marginBottom: 20 * scale,
          }]}>
            {name}
          </Text>
          
          <Text style={[styles.bodyText, { 
            fontSize: 16 * scale,
            marginBottom: 16 * scale,
          }]}>
            has successfully completed the requirements for
          </Text>
          
          <Text style={[styles.courseName, { 
            fontSize: 28 * scale,
            marginTop: 10 * scale,
          }]}>
            {course}
          </Text>
          
          <Text style={[styles.completionText, { 
            fontSize: 15 * scale,
            marginTop: 30 * scale,
          }]}>
            Demonstrating proficiency and dedication in the field of study
          </Text>
        </View>

        {/* Footer */}
        <View style={[styles.footer, { marginTop: 50 * scale }]}>
          <View style={styles.footerRow}>
            {/* Date Section */}
            <View style={styles.footerItem}>
              <Text style={[styles.footerLabel, { fontSize: 11 * scale }]}>
                DATE OF COMPLETION
              </Text>
              <Text style={[styles.footerValue, { 
                fontSize: 14 * scale,
                marginTop: 8 * scale,
              }]}>
                {date}
              </Text>
              <View style={[styles.underline, { 
                width: 140 * scale,
                marginTop: 8 * scale,
              }]} />
            </View>

            {/* Certificate ID */}
            <View style={styles.footerItem}>
              <Text style={[styles.footerLabel, { fontSize: 11 * scale }]}>
                CERTIFICATE ID
              </Text>
              <Text style={[styles.footerValue, { 
                fontSize: 14 * scale,
                marginTop: 8 * scale,
              }]}>
                {certId}
              </Text>
              <View style={[styles.underline, { 
                width: 140 * scale,
                marginTop: 8 * scale,
              }]} />
            </View>
          </View>

          {/* Signature */}
          <View style={[styles.signatureSection, { marginTop: 40 * scale }]}>
            <View style={styles.signatureBox}>
              <Text style={[styles.signature, { 
                fontSize: 36 * scale,
                fontFamily: "MomoSignature-Regular",
              }]}>
                James.

              </Text>
              <View style={[styles.signatureLine, { 
                width: 180 * scale,
                marginTop: 10 * scale,
              }]} />
              <Text style={[styles.signatureTitle, { 
                fontSize: 13 * scale,
                marginTop: 8 * scale,
              }]}>
                Program Director
              </Text>
              <Text style={[styles.signatureName, { fontSize: 12 * scale }]}>
James Anderson

              </Text>
            </View>
          </View>
        </View>

  
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "#ffffff",
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  bgContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
  },
  seal: {
    backgroundColor: "#1e40af",
    justifyContent: "center",
    alignItems: "center",
    borderColor: "#1e40af",
  },
  sealText: {
    color: "#ffffff",
    fontWeight: "900",
    letterSpacing: 2,
  },
  institution: {
    fontWeight: "700",
    color: "#1a365d",
    textAlign: "center",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  tagline: {
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  titleSection: {
    alignItems: "center",
  },
  certType: {
    fontWeight: "700",
    color: "#1a365d",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  body: {
    alignItems: "center",
    width: "100%",
  },
  bodyText: {
    color: "#475569",
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 24,
  },
  recipientName: {
    fontWeight: "400",
    color: "#1a365d",
    textAlign: "center",
    fontStyle: "italic",
    borderBottomWidth: 2,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 8,
  },
  courseName: {
    fontWeight: "700",
    color: "#2563eb",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  completionText: {
    color: "#64748b",
    fontWeight: "400",
    textAlign: "center",
    fontStyle: "italic",
    lineHeight: 22,
  },
  footer: {
    width: "100%",
    alignItems: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  footerItem: {
    alignItems: "center",
  },
  footerLabel: {
    color: "#94a3b8",
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  footerValue: {
    color: "#1e293b",
    fontWeight: "600",
  },
  underline: {
    height: 1,
    backgroundColor: "#cbd5e1",
  },
  signatureSection: {
    width: "100%",
    alignItems: "center",
  },
  signatureBox: {
    alignItems: "center",
  },
  signature: {
    color: "#1e40af",
  },
  signatureLine: {
    height: 2,
    backgroundColor: "#1a365d",
  },
  signatureTitle: {
    color: "#475569",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  signatureName: {
    color: "#64748b",
    fontWeight: "400",
    marginTop: 2,
  },
  verificationBar: {
    backgroundColor: "#f8fafc",
    width: "100%",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  verificationText: {
    color: "#94a3b8",
    fontWeight: "500",
  },
});