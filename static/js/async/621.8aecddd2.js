"use strict";(self.webpackChunk_callstack_byorg_docs=self.webpackChunk_callstack_byorg_docs||[]).push([["621"],{9343:function(e,n,a){a.r(n),a.d(n,{default:function(){return i}});var s=a(651),r=a(6971),t=a(4646);function c(e){let n=Object.assign({h1:"h1",a:"a",h2:"h2",p:"p",h3:"h3",pre:"pre",code:"code"},(0,r.ah)(),e.components);return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.h1,{id:"usage",children:["Usage",(0,s.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#usage",children:"#"})]}),"\n",(0,s.jsxs)(n.h2,{id:"creating-an-app",children:["Creating an app",(0,s.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#creating-an-app",children:"#"})]}),"\n",(0,s.jsx)(n.p,{children:"Here is step by step how to start with byorg."}),"\n","\n",(0,s.jsxs)(t.Steps,{children:[(0,s.jsx)(n.h3,{children:"Create a chat model instance"}),(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"import { VercelChatModelAdapter } from '@callstack/byorg-core';\nimport OpenAI from 'openai';\nimport { createOpenAI } from '@ai-sdk/openai';\n\nconst LANGUAGE_MODEL = 'gpt-4o-2024-08-06';\n\nconst openAiProvider = createOpenAI({\napiKey: 'your-api-key',\ncompatibility: 'strict', // strict mode, enable when using the OpenAI API\n});\n\nconst openAiModel = openAiProvider.languageModel(LANGUAGE_MODEL);\n\nconst chatModel = new VercelChatModelAdapter({\n  languageModel: openAiModel,\n});\n"})}),(0,s.jsx)(n.h3,{children:"Create an Application instance"}),(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"import { VercelChatModelAdapter } from '@callstack/byorg-core';\n\nconst app = createApp({\n  chatModel\n});\n"})}),(0,s.jsx)(n.h3,{children:"Process user messages"}),(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"const messages = [{ role: 'user', content: 'First message!' }]\nconst response = await app.processMessages(messages);\n"})})]}),"\n","\n",(0,s.jsx)(n.p,{children:"That's it! Your message is being handled an processed by byorg."}),"\n",(0,s.jsx)(n.p,{children:"In next sections we will go through customisation, error handling and changing LLM provider, to better suit your needs."})]})}function o(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:n}=Object.assign({},(0,r.ah)(),e.components);return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}let i=o;o.__RSPRESS_PAGE_META={},o.__RSPRESS_PAGE_META["docs%2Fcore%2Fusage.mdx"]={toc:[{text:"Creating an app",id:"creating-an-app",depth:2}],title:"Usage",frontmatter:{}}}}]);