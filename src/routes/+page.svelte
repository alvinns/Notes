<script lang="ts">
    import { notes } from './store';
    import Note from './Note.svelte';
    import Modal from './Modal.svelte';
    import NoteDetail from './NoteDetail.svelte';
    import { scale } from 'svelte/transition';
    
    let showModal = false;
    let showDetailModal = false;
    let selectedNoteId: number | null = null;
    
    function createNote() {
        const newId = $notes.length > 0 ? Math.max(...$notes.map(n => n.id)) + 1 : 1;
        const newX = Math.random() * 40 + 20;
        const newY = Math.random() * 30 + 20;
        
        const colors = ['#2C3E50', '#FFD700', '#C0392B', '#27AE60'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        const shapes: ('square' | 'circle')[] = ['square', 'circle'];
        const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
        
        const newNote = {
            id: newId,
            title: 'New Note',
            content: '',
            color: randomColor,
            shape: randomShape,
            x: newX,
            y: newY,
            pinned: false
        };
        
        notes.update(currentNotes => [...currentNotes, newNote]);
        
        selectedNoteId = newId;
        showModal = true;
    }
    
    function openDetailModal(event: CustomEvent) {
        selectedNoteId = event.detail.noteId;
        showDetailModal = true;
    }
    
    $: pinnedNotes = $notes.filter(note => note.pinned);
    $: unpinnedNotes = $notes.filter(note => !note.pinned);
</script>

<style>
    :global(html) {
        height: 100%;
        overflow: hidden;
    }

    :global(body) {
        margin: 0;
        padding: 0;
        color: white;
        font-family: 'Fira Sans', sans-serif;
        font-weight: 500;
        height: 100%;
        width: 100%;
        overflow: hidden;
        /* Remove position: fixed to allow background to show */
        background: radial-gradient(circle at center, #1D2B4D, #03040B);
    }
    
    .app-container {
        position: absolute; /* Changed from relative */
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        padding: 20px;
        box-sizing: border-box;
        display: grid;
        place-items: center;
        overflow: hidden;
    }
    
    .pinned-notes-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        padding: 15px 0;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        background: linear-gradient(180deg, #1A203C 0%, #0F162C 100%);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        box-shadow: 0 1px 5px rgba(0,0,0,0.3);
        max-height: 120px;
        overflow-x: auto;
        overflow-y: hidden;
    }
    
    .pinned-notes-label {
        color: #BEC6E1;
        font-size: 16px;
        text-transform: uppercase;
        text-align: center;
        min-width: 120px;
        margin-right: 0;
        flex-shrink: 0;
    }
    
    .create-button {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        padding: 15px 40px;
        border-radius: 25px;
        background: linear-gradient(45deg, #34415E, #26345B);
        color: white;
        font-size: 18px;
        border: none;
        cursor: pointer;
        z-index: 100;
    }
    
    .no-pinned-notes {
        text-align: center;
        color: #9A9AAA;
        margin: 20px;
        font-style: italic;
        font-weight: 300;
        position: absolute;
        top: 70px;
    }
</style>

<div class="app-container">
    {#if pinnedNotes.length > 0}
        <div class="pinned-notes-container">
            <div class="pinned-notes-label">Pinned Notes:</div>
            {#each pinnedNotes as note (note.id)}
                <Note note={note} isPinned={true} on:openDetail={openDetailModal} />
            {/each}
        </div>
    {:else}
        <div class="no-pinned-notes">No pinned notes available</div>
    {/if}
    
    {#each unpinnedNotes as note (note.id)}
        <Note note={note} isPinned={false} on:openDetail={openDetailModal} />
    {/each}
    
    <button class="create-button" on:click={createNote}>Create</button>
    
    {#if showModal}
        <Modal bind:showModal bind:noteId={selectedNoteId} />
    {/if}
    
    {#if showDetailModal && selectedNoteId !== null}
        <NoteDetail 
            bind:showModal={showDetailModal} 
            noteId={selectedNoteId} 
            on:close={() => { showDetailModal = false; selectedNoteId = null; }}
        />
    {/if}
</div>