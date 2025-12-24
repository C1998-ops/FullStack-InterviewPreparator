interface Links {
  [key: string]: string;
}
interface FooterData {
  title: string;
  developer: string;
  description?: string | undefined;
  links: Links;
}
const footerData: FooterData[] = [
  {
    title: "App Development",
    developer: "Chetan Kumar",
    description: "Full Stack Developer",
    links: {
      LinkedIn: "https://www.linkedin.com/in/chetan-kumar-gn/",
      GitHub: "https://github.com/C1998-ops",
    },
  },
  {
    title: "Content Curation",
    developer: "Rohan Paul",
    description: "Original collection of JavaScript interview resources",
    links: {
      GitHub: "https://github.com/rohan-paul/Awesome-JavaScript-Interviews",
    },
  },
  {
    title: "Built With",
    developer: "Vanilla JavaScript, HTML5 & CSS3",
    links: {
      Marked: "https://marked.js.org/",
    },
  },
];
export default footerData;
