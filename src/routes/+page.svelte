<script>
    import {Modal, Label, Input, Button, Navbar, NavBrand, NavHamburger, NavUl, NavLi} from 'flowbite-svelte';
    import {onMount} from "svelte";

    let formModal = false;
    let name = '';
    let disabledB = true;
    let messsage = '';
    let dexists_platform = false;
    let btn_copy = 'Copy your link'
    let ids = '';
    onMount(() => {
        let id = localStorage.getItem("__id_platforms")
        if (id) {
            ids = id
            dexists_platform = true
        }

        fetch('https://gmas-backend.efal.lol/', {
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
    })

    async function handleSubmit(event) {
        event.preventDefault();
        fetch('https://gmas-backend.efal.lol/platform?name='+name, {
            credentials: 'include',
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                return response.json();
            })
            .then(data => {
                localStorage.setItem("__name_platforms", name)
                localStorage.setItem("__id_platforms", data.id)
                messsage = 'Platform successfully created!'
            })
            .catch(error => {
                messsage = 'Platform not successfully'
                console.error('There was a problem with the fetch operation:', error);
            });
        setTimeout(() => {
            formModal = false;
            disabledB = true;
            dexists_platform = true
            messsage = '';
            name = '';
        }, 3000)
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

<div class="flex justify-center items-center">
    <div class=" text-center">
        <div class="mt-10 mb-0">
            <span class="text-xl poppins-semibold dark:text-white">
                Give Me A Song
            </span>
        </div>
        <div class="mt-5">
            <span class="text-lg poppins-regular dark:text-white">
                Lewat Give Me A Song, kamu bisa kirim pesan rahasia barengan sama lagu yang pas banget sama vibes hati kamu ke dia.
                <br>
                Atau kamu bisa buat platform kamu sendiri dan bagikan ke teman teman kamu
            </span>
        </div>
        <div class="mt-7">
            <Button color="dark" disabled={dexists_platform} on:click={() => formModal = true}>Create Your Platform</Button>
        </div>
        {#if dexists_platform}
            <div class="mt-10">
                <Button on:click={async () => {
    try {
        let ids = localStorage.getItem("__id_platforms")
      await navigator.clipboard.writeText(document.location + ids);
        btn_copy = "Copy to clipboard"
        setTimeout(() => {
            btn_copy = "Copy your link"
        }, 2000)
    } catch (err) {
      alert('Failed to copy text');
    }}}>{btn_copy}</Button>
            </div>
        {/if}
    </div>
</div>

<Modal bind:open={formModal} size="xs" autoclose={false} class="w-full">
    <form on:submit={handleSubmit} class="flex flex-col space-y-6" action="#">
        <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Create your platform</h3>
        <Label class="space-y-2">
            <span>Name</span>
            <Input
                    type="text"
                    name="name"
                    bind:value={name}
                    placeholder=""
                    required
                    on:focus={() => {
                    name.length > 0 ? disabledB = false : disabledB = true;
                    }}
                    on:input={() => {
                    name.length > 0 ? disabledB = false : disabledB = true;
                }}
            />
        </Label>
        <span class="text-sm poppins-semibold">
            {messsage}
        </span>
        <Button
                type="submit"
                class="w-full1"
                disabled={disabledB}
        >Create Platform</Button>
    </form>
</Modal>