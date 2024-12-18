<script>
    import {onMount, tick} from "svelte";
    import { Button, Card, Input, Label, Navbar, NavBrand, NavHamburger, NavLi, NavUl, Toast } from "flowbite-svelte";
    import { page } from "$app/stores";

    let slug = $page.params.slug;
    let data = {
        platform: null,
        data: [],
        totalPages: 0
    };
    let song = [];
    let disabledB = true;
    let songKeyword = '';
    let selectedSong = null;
    let message = '';

    // Notification state
    let showToast = false;
    let toastMessage = '';
    let toastType = 'success';



    let commentPage = 1;
    let commentLimit = 5;
    let isLoadingComments = false;
    let hasMoreComments = true;
    let commentsContainer;

    // Infinite scroll variables for songs
    let offset = 0;
    let limit = 10;
    let isLoadingSongs = false;
    let hasMoreSongs = true;
    let ids = '';
    onMount(() => {
        let id = localStorage.getItem("__id_platforms")
        if (id) {
            ids = id
        }

        fetchComments();
        fetch('https://gmas-backend.refaldy.id/', {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    alert(`Error: ${response.status}`);
                    throw new Error('Network response was not ok');
                }

                return response.json();
            })
            .catch(error => {
                alert("Can't Connect To Server")
                console.error('There was a problem with the fetch operation:', error);
            });
    });

    async function fetchComments() {
        if (isLoadingComments || !hasMoreComments) return;

        isLoadingComments = true;

        try {
            const response = await fetch(`https://gmas-backend.refaldy.id/comments?page=${commentPage}&limit=${commentLimit}&id=${slug}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();

            if (result.data.length === 0) {
                hasMoreComments = false
            } else {
                hasMoreComments = true
            }
            if (commentPage === 1) {
                data = result;
            } else {
                data.data = [...data.data, ...result.data];
            }

            isLoadingComments = false;
        } catch (error) {
            console.error('There was a problem fetching comments:', error);
            isLoadingComments = false;
        }
    }

    function selectSong(selected) {
        selectedSong = selected;
        songKeyword = selected.name + " - " + selected.artist;
        song = [];
        offset = 0;
        hasMoreSongs = true;
    }

    async function sendMessage(event) {
        event.preventDefault();

        // Validate message and selected song
        if (!message.trim()) {
            showToast = true;
            toastMessage = 'Please enter a message';
            toastType = 'error';
            return;
        }

        if (!selectedSong) {
            showToast = true;
            toastMessage = 'Please select a song';
            toastType = 'error';
            return;
        }

        try {
            const response = await fetch('https://gmas-backend.refaldy.id/comment', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    platform_id: slug,
                    comment: message,
                    song: {
                        id: selectedSong.id,
                        name: selectedSong.name,
                        artists: selectedSong.artist,
                        image: {
                            url: selectedSong.album.images[0].url
                        }
                    }
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Reset comments and fetch the latest
            commentPage = 1;
            hasMoreComments = true;
            await fetchComments();

            showToast = true;
            toastMessage = 'Message sent successfully!';
            toastType = 'success';

            message = '';
            selectedSong = null;
            songKeyword = '';
            disabledB = true;
        } catch (error) {
            console.error('Error sending message:', error);
            showToast = true;
            toastMessage = 'Failed to send message. Please try again.';
            toastType = 'error';
        }
    }

    let timeout;
    function handleCommentScroll(event) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            const { scrollTop, clientHeight, scrollHeight } = event.target;
            if (scrollHeight - scrollTop <= clientHeight + 50 && hasMoreComments) {
                commentPage++;
                fetchComments();
            }
        }, 100);
    }

    function handleScroll(event) {
        const { scrollTop, clientHeight, scrollHeight } = event.target;

        if (scrollHeight - scrollTop <= clientHeight + 50) {
            loadMoreSongs();
        }
    }

    async function searchSong(keyword) {
        if (!keyword) {
            song = [];
            offset = 0;
            hasMoreSongs = true;
            return;
        }

        // Reset state when starting a new search
        offset = 0;
        isLoadingSongs = true;
        hasMoreSongs = true;

        try {
            const response = await fetch(`https://gmas-backend.refaldy.id/search?query=${keyword}&market=ID&limit=${limit}&offset=${offset}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const d = await response.json();
            song = d.data.tracks.items;

            hasMoreSongs = song.length === limit;
            isLoadingSongs = false;
        } catch (error) {
            song = [];
            isLoadingSongs = false;
            console.error('There was a problem with the fetch operation:', error);
        }
    }



    async function loadMoreSongs() {
        if (isLoadingSongs || !hasMoreSongs || !songKeyword) return;

        isLoadingSongs = true;
        offset += limit;

        try {
            const response = await fetch(`https://gmas-backend.refaldy.id/search?query=${songKeyword}&market=ID&limit=${limit}&offset=${offset}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const d = await response.json();
            const newSongs = d.data.tracks.items;

            song = [...song, ...newSongs];

            hasMoreSongs = newSongs.length === limit;
            isLoadingSongs = false;
        } catch (error) {
            isLoadingSongs = false;
            console.error('There was a problem with the fetch operation:', error);
        }
    }
</script>

<Navbar>
    <NavBrand href="/">
        <span class="self-center whitespace-nowrap poppins-semibold dark:text-white">gmas.</span>
    </NavBrand>
    <NavHamburger />
    <NavUl>
        <NavLi href="/">Home</NavLi>
        {#if ids !== "" && ids !== null}
            <NavLi href={`/${ids}`}>My Room</NavLi>
        {/if}
    </NavUl>
</Navbar>

<div class="container mx-auto px-4 py-8">
    {#if showToast}
        <Toast
                position="top-right"
                color={toastType === 'success' ? 'green' : 'red'}
                on:close={() => showToast = false}
        >
            {toastMessage}
        </Toast>
    {/if}

    <div class="grid md:grid-cols-2 gap-8">
        <!-- Form Column -->
        <div>
            <Card>
                <form class="flex flex-col space-y-6" on:submit={sendMessage}>
                    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">
                        Send your message for {data?.platform?.name}
                    </h3>
                    <Label class="space-y-2">
                        <span>Message</span>
                        <Input
                                type="text"
                                name="message"
                                placeholder="type ur message"
                                bind:value={message}
                                on:input={() => {
                                message.length > 0 ? disabledB = false : disabledB = true;
                            }}
                                required
                        />
                    </Label>
                    <Label class="space-y-2">
                        <span>Music</span>
                        <Input
                                type="text"
                                name="music"
                                placeholder="search music"
                                bind:value={songKeyword}
                                on:input={() => searchSong(songKeyword)}
                        />
                        {#if song.length > 0}
                            <Card>
                                <ul
                                        class="bg-white dark:bg-gray-800 border rounded-md overflow-y-auto max-h-64"
                                        on:scroll={handleScroll}
                                >
                                    {#each song as track}
                                        <li
                                                class="px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex items-center space-x-4"
                                                on:click={() => selectSong(track)}
                                        >
                                            <img
                                                    src={track.album.images[0].url}
                                                    alt={track.name}
                                                    class="w-12 h-12 rounded"
                                            />
                                            <div>
                                                <div class="font-semibold">{track.name} - {track.artist}</div>
                                            </div>
                                        </li>
                                    {/each}
                                    {#if isLoadingSongs}
                                        <li class="px-4 py-2 text-center text-gray-500">Loading more...</li>
                                    {/if}
                                    {#if !hasMoreSongs && !isLoadingSongs}
                                        <li class="px-4 py-2 text-center text-gray-500">No more results</li>
                                    {/if}
                                </ul>
                            </Card>
                        {/if}
                    </Label>
                    <Button
                            disabled={disabledB}
                            type="submit"
                            class="w-full"
                    >Send Message</Button>
                </form>
            </Card>
        </div>

        <div>
            <div
                    class="overflow-y-auto max-h-[600px]"
                    on:scroll={handleCommentScroll}
            >
                {#if data.data.length > 0}
                    <ul class="space-y-4">
                        {#each data.data as comment}
                            <li>
                                <Card>
                                    <div class="flex flex-col space-y-4">
                                        <div class="flex items-center space-x-4">
                                            {#if comment.song}
                                                <img
                                                        src={comment.song.image.url}
                                                        alt={comment.song.name}
                                                        class="w-12 h-12 rounded"
                                                />
                                            {/if}
                                            <div>
                                                <div>{comment.comment}</div>
                                                {#if comment.song}
                                                    <div class="text-sm text-gray-500">
                                                        {comment.song.name} - {comment.song.artists}
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                        {#if comment.song}
                                            <div class="w-full">
                                                <iframe
                                                        src={`https://open.spotify.com/embed/track/${comment.song.id}`}
                                                        width="100%"
                                                        height="80"
                                                        frameborder="0"
                                                        allowtransparency="true"
                                                        allow="encrypted-media"
                                                        class="rounded"
                                                >
                                                </iframe>
                                            </div>
                                        {/if}
                                    </div>
                                </Card>
                            </li>
                        {/each}
                    </ul>
                {/if}

                {#if isLoadingComments}
                    <Card>
                        <div class="text-center text-gray-500">Loading more comments...</div>
                    </Card>
                {/if}

                {#if !hasMoreComments && data.data.length === 0}
                    <Card>
                        <div class="text-center text-gray-500">No comments yet</div>
                    </Card>
                {/if}
            </div>
        </div>
    </div>
</div>