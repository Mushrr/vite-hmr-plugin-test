import { Plugin, TransformResult } from 'vite'
import { LoadResult } from 'rollup'
import * as fs from 'fs/promises';

function parser(src: string) {
    // 解析
    
    const lines = src.split('\n');
    let todoList = "";
    let finishRegex = /^X/;
    let readyRegex = /^O/;
    let content = /\s(.*)$/
    let randomId: string;
    for (let line of lines) {
        randomId = Math.random().toString(32).slice(2);
        let html: string;
        if (finishRegex.test(line)) {
            console.log(line);
            html = `<li><input type='checkbox' checked id='${randomId}'/><label for='${randomId}'>${line.trim().match(content)![1]}</li>`
            console.log("通过",html);        
        } else if (readyRegex.test(line)) {
            html = `<li><input type='checkbox' id='${randomId}'/><label for='${randomId}'>${line.trim().match(content)![1]}</li>`
            console.log("拒绝",html);        
        }
        todoList += html!;
    }
    return todoList;
}

export default function todoParser(): Plugin {
    let todoFileRegex = /\.(todo)$/;

    // local variable
    function log(msg) {
        console.log(msg);
    }

    return {
        name: "todo-parser",
        transformIndexHtml(html) {
            return html.replace(/<title>(.*?)<\/title>/, '<title>TODO Parser</title>');
        },

        transform(src, id) {
            // module inject
            console.log(id);
            if (todoFileRegex.test(id)) {  
                return {
                    code: `
                    export let data = "${parser(src)}"
                    export ${parser}
                    if (import.meta.hot) {
                        import.meta.hot.on('special-update', (data) => {
                            data = parser(data.updateVal);
                            document.body.innerHTML = data;
                        })
                    }
                    `,
                    
                };
            }
        },

        async handleHotUpdate({ server, file, modules }) {
            let fileData = await fs.readFile(modules[0].id as string);
            server.ws.send({
                type: 'custom',
                event: 'special-update',
                data: {
                    msg: "Update from server",
                    updateVal: fileData.toString()
                }
            })
            console.log(`${file} should be updated`);
            
            return [];
        }
    }
}