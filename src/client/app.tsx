import { Container, createRoot } from "react-dom/client";
import { useState, useEffect, SubmitEvent } from "react";
import * as api from "./apiHandler";
import { Variable, CacheKeys } from "./types";

// alias types just so i don't have to type api every time
type Channel = api.Channel;
type Message = api.Message;

interface ChatProps {
    channels: Variable<Channel[]>;
    openChannel: Variable<Channel>;
    shouldRefresh: Variable<boolean>;
    markRefresh: () => void;
};

const Titlebar = (props: ChatProps) => (
    <nav className="titlebar flex horiz round-bg">
        <div className="flex horiz items-left">
            <h1>ChApp</h1>
            <h2>#{props.openChannel.value.name}</h2>
        </div>
        <div className="grow"></div>
        <div className="flex horiz items-right">
            <p>@{localStorage.getItem(CacheKeys.USERNAME)}</p>
            <a href="/settings"><i className="nf nf-fa-cog"></i></a>
            <a href="/logout"><i className="nf nf-md-exit_run"></i></a>
        </div>
    </nav>
);

async function onChannelAddCreate(
    e: SubmitEvent<HTMLFormElement>,
    props: ChatProps
) {
    e.preventDefault();

    const name = (e.target.querySelector("#new-channel-input")! as HTMLInputElement).value;

    if (!name) {
        return false;
    }

    await api.createChannel(name);
    props.markRefresh();

    return false;
}

const ChannelsWindow = (props: ChatProps) => {
    const Channel = (channel: Channel) => {
        let classes = "flex horiz clickable";
        if (props.openChannel.value.name === channel.name) {
            classes += " focused";
        }

        return <div className={classes}>
            <span className="grow accent" onClick={(e) => {
                e.preventDefault();
                props.openChannel.set(channel);
            }}>#{channel.name}</span>

            <span className="clickable" onClick={async (e) => {
                e.preventDefault();

                await api.deleteChannel(channel);
                props.markRefresh();

                return false;
            }}>
                <i className="nf nf-oct-x"></i>
            </span>
        </div>;
    };

    return <div className="round-bg channels">
        <form className="flex horiz" onSubmit={(e) => onChannelAddCreate(e, props)}>
            <input
                className="grow"
                type="text"
                id="new-channel-input"
                pattern="[A-Za-z_\-.]{1,16}"
                placeholder="new channel..."
            />
            <input type="submit" value="+" />
        </form>

        <div>
            {props.channels.value.map(Channel)}
        </div>
    </div >;
};

const onChatSubmit = (
    e: SubmitEvent<HTMLFormElement>,
    props: ChatProps
) => {
    e.preventDefault();

    const textbox = e.target.querySelector("#message-textbox")! as HTMLInputElement;

    const msg = textbox.value;

    if (msg) {
        console.log("msg:", msg, "!!!!");
        textbox.value = "";
    }

    return false;
};

const ChatWindow = (props: ChatProps) => {
    const [messages, setMessages] = useState<Message[]>([]);

    // fetch all messages from inputted open channel
    useEffect(() => {
        (async () => {
            const fetchMessages = await api.fetchMessages(props.openChannel.value);
            setMessages(fetchMessages);
        })();
    }, [props.shouldRefresh.value]);

    const Message = (message: Message) => (
        <div className="message">
            <p className="username">{message.from}</p>
            <p className="message-content">{message.content}</p>
        </div>
    );

    const inner = messages.length > 0
        ? messages.map(Message)
        : <h3>no messages yet!</h3>;

    return <div className="round-bg grow chat">
        <div className={`grow ${messages.length === 0 ? "flex center" : ""}`}>
            {inner}
        </div>

        <form
            className="flex horiz"
            onSubmit={(e) => onChatSubmit(e, props)}
        >
            <input
                id="message-textbox"
                className="grow"
                type="text"
                placeholder="type message..."
            />
            <input type="submit" value="send" />
        </form>
    </div>;
};

const RootWidget = () => {
    // marker in root widget that allows children to fetch 
    // within themselves using useEffect
    const [refresh, setRefresh] = useState(false);
    const markRefresh = () => setRefresh(!refresh);

    // ~~~ try to get cached values ~~~

    const channelsCached = localStorage.getItem(CacheKeys.CHANNELS);
    const openChannelIndex = Number(localStorage.getItem(CacheKeys.OPEN_CHANNEL_INDEX) ?? -1);

    const [channels, setChannels] = useState<Channel[]>(
        channelsCached ? JSON.parse(channelsCached) : []
    );

    // try to get open channel, default to "loading" empty channel
    const [openChannel, setOpenChannel] = useState<Channel>(
        channels[openChannelIndex] ??
        { name: "loading...", messages: [] }
    );

    // then fetch and overwrite the channels when it's done
    useEffect(() => {
        (async () => {
            const fetchedChannels = await api.fetchChannels();
            setChannels(fetchedChannels);
            localStorage.setItem(CacheKeys.CHANNELS, JSON.stringify(fetchedChannels));

            // set open channel to first fetched channel if 
            //   current one cannot be found in the new fetch
            if (fetchedChannels.findIndex((c => c.name === openChannel.name)) === -1) {
                if (fetchedChannels[0]) {
                    setOpenChannel(fetchedChannels[0]);
                } else {
                    setOpenChannel({
                        name: "no channels yet!",
                        messages: []
                    })
                }

                localStorage.setItem(CacheKeys.OPEN_CHANNEL_INDEX, "0");
            }
        })();
    }, [refresh]);

    const props: ChatProps = {
        channels: {
            value: channels,
            set: setChannels,
        },
        openChannel: {
            value: openChannel,
            set: setOpenChannel,
        },
        shouldRefresh: { value: refresh, set: setRefresh },
        markRefresh,
    }

    return <div className="root-ui-flex horiz">
        {ChannelsWindow(props)}

        <div className="root-ui-flex vert grow">
            {Titlebar(props)}
            {ChatWindow(props)}
        </div>

    </div>;
};

function init() {
    const root = createRoot(document.getElementById("content") as Container);
    root.render(<RootWidget />);
};

window.onload = init;
