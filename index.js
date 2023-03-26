import { createApp, ref,reactive } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const askGPT = async (prompt,key) => {
    const res = await fetch('https://api.markprompt.com/completions?projectKey=' + key, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': 'Bearer NRM0OJlk5ob4xtg5wldzs5kHAWWyyvOX'
            //'Authorization': 'Bearer '
        },
        body: JSON.stringify({
            prompt,
            iDontKnowMessage: "I don't know",
        }),
    });


    if (!res.ok || !res.body) {
    console.error('Error:', await res.text());
    return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();    

    return async () => {
        const { value, done } = await reader.read();
        const chunk = decoder.decode(value);
        return {chunk, done};
    }
}

createApp({
    setup() {
        var prompt = ref("");
        const myinput = ref(null)
        

        const chats = ref([]);
        //const reply = ref("Reply: ");
        var send = async () => {
            const key = myinput.value.getAttribute("prompt-key")
            const promptValue = prompt.value;
            prompt.value = "";
            myinput.value.focus();
            chats.value.push({
                text: promptValue,
                human:true
            });
            var reply = reactive({
                sources: [],
                text: ""
            });
            chats.value.push(reply);
            var read = await askGPT(promptValue, key);
            if(!read) {
                reply.text = "Sorry, I can't answer that question yet."
            }
            let tmp = "";
            while(true) {
                var {chunk, done} = await read();                               
                tmp += chunk;

                if(tmp.indexOf("___START_RESPONSE_STREAM___")) {
                    const parts = tmp.split("___START_RESPONSE_STREAM___")
                    reply.text = parts[1];
                }
               
                if(done) {
                    const parts = tmp.split("___START_RESPONSE_STREAM___")
                    reply.sources = JSON.parse(parts[0]);
                    break;
                }
            }

            
        }

        return {
            prompt,
            send,
            chats,
            myinput
        }
    }
}).mount("#app");


