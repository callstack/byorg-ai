"use strict";(self.webpackChunk_callstack_byorg_docs=self.webpackChunk_callstack_byorg_docs||[]).push([["348"],{5929:function(e,n,t){t.r(n),t.d(n,{default:function(){return a}});var s=t(651),o=t(6971);function r(e){let n=Object.assign({h1:"h1",a:"a",p:"p",div:"div",h2:"h2",code:"code",pre:"pre"},(0,o.ah)(),e.components);return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.h1,{id:"tools",children:["Tools",(0,s.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#tools",children:"#"})]}),"\n",(0,s.jsx)(n.p,{children:"You can extend the capabilities of your assistant by providing it with tools.\nTools are functions attached to the AI request. Once the request is received, the AI can decide to use these tools to enrich the context,\nfetch more data, or save information."}),"\n",(0,s.jsxs)(n.div,{className:"rspress-directive info",children:[(0,s.jsx)(n.div,{className:"rspress-directive-title",children:"INFO"}),(0,s.jsx)(n.div,{className:"rspress-directive-content",children:(0,s.jsx)(n.p,{children:"OpenAI has implemented tools, but not all AI providers do."})})]}),"\n",(0,s.jsxs)(n.h2,{id:"adding-tools",children:["Adding tools",(0,s.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#adding-tools",children:"#"})]}),"\n",(0,s.jsxs)(n.p,{children:["First lets start by implementing the tool function. There are two inputs for it ",(0,s.jsx)(n.code,{children:"params"})," that are decided\nby the AI and context that is passed by byorg. Tool function has to return a string, as the information\nreturned by it will be then passed back to AI as an 'addition' to system prompt."]}),"\n",(0,s.jsxs)(n.p,{children:["To start, implement the tool function. It takes two inputs: ",(0,s.jsx)(n.code,{children:"params"}),", which are determined by the AI, and ",(0,s.jsx)(n.code,{children:"context"}),", which is passed by byorg.\nThe tool function must return a string, as this information will be passed back to the AI as an addition to the system prompt."]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"\nasync function queryUsers(params: { query: string }, context: RequestContext): Promise<string> {\n  const { query } = params;\n  const { references } = context;\n\n  const users = await getMatchingusers(query);\n\n  return formatUsersResponse(users);\n}\n"})}),"\n",(0,s.jsx)(n.p,{children:"Next, describe this function for the AI to help it understand when and how to use it."}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"import z from 'zod';\n\nconst queryUsersTool: ApplicationTool = {\n  name: 'query_users',\n  parameters: z.object({\n    query: z\n      .string()\n      .describe(\n        'Query to users list, can include user name, id, email or role in company etc.',\n      ),\n  }),\n  description:\n    'Search information about users, by name, id, email or role etc.',\n  handler: queryUsers,\n};\n"})}),"\n",(0,s.jsx)(n.p,{children:"Once the function is implemented and described, wrap it into the plugin system and connect it to the app."}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"const toolsPlugin: ApplicationPlugin = {\n  name: 'tools',\n  tools: [queryUsersTool],\n};\n\nconst app = createApp({\n  chatModel,\n  plugins: [\n    toolsPlugin,\n  ]\n  systemPrompt,\n});\n"})}),"\n",(0,s.jsx)(n.p,{children:"Tools are an excellent place to implement embedding for inserts or other RAG (Retrieval-Augmented Generation) functionalities."}),"\n",(0,s.jsxs)(n.p,{children:["Your tools might attach data from a specific source. If you want to inform users about the data source, you can use ",(0,s.jsx)(n.code,{children:"references"})," from the context object.\nWe’ll discuss that next."]})]})}function i(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:n}=Object.assign({},(0,o.ah)(),e.components);return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(r,{...e})}):r(e)}let a=i;i.__RSPRESS_PAGE_META={},i.__RSPRESS_PAGE_META["docs%2Fcore%2Ftools.md"]={toc:[{text:"Adding tools",id:"adding-tools",depth:2}],title:"Tools",frontmatter:{}}}}]);