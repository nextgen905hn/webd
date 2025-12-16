import { create } from "zustand";
import htmlData from '../data/html.json';
import cssData from '../data/css.json';
import jsData from '../data/js.json';
import reactData from '../data/react.json';
import nextjsData from '../data/nextjs.json';
import nodejsData from '../data/nodejs.json';
import expressData from '../data/express.json';
import mongodbData from '../data/mongodb.json';
import redisData from '../data/redis.json';
const courseMap = {
  html: htmlData,
  css: cssData,
  js: jsData,
  react: reactData,
  nextjs: nextjsData,
  nodejs: nodejsData,
  expressjs: expressData,
  mongodb: mongodbData,
  redis: redisData,
};

export const useCoursesStore = create((set) => ({
  coursesMeta: [
    { id: "html", title: "HTML" },
    { id: "css", title: "CSS" },
    { id: "js", title: "JavaScript" },
    { id: "react", title: "React" },
    { id: "nextjs", title: "Next.js" },
    { id: "nodejs", title: "Node.js" },
    { id: "expressjs", title: "Express.js" },
    { id: "mongodb", title: "MongoDB" },
    { id: "redis", title: "Redis" },
  ],
  lessonsdata: {},

 
  loadCourse: (courseId) => {
  const data = courseMap[courseId];
  if (data) {
    set((state) => ({
      lessonsdata: { ...state.lessonsdata, [courseId]: data },
    }));
  }
},

}));
