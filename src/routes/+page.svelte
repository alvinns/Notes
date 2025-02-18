<script lang="ts">
    import { notes } from './store';
    import Note from './Note.svelte';
    import Modal from './Modal.svelte';
    import NoteDetail from './NoteDetail.svelte';
    
    let showModal = false;
    let showDetailModal = false;
    let selectedNoteId: number | null = null;
    
    // Function to create a new note
    function createNote() {
        const newId = $notes.length > 0 ? Math.max(...$notes.map(n => n.id)) + 1 : 1;
        const newX = Math.random() * 60 + 20; // Random position between 20% and 80% of screen width
        const newY = Math.random() * 40 + 30; // Random position between 30% and 70% of screen height
        
        // Colors array to randomly select from
        const colors = ['blue', 'yellow', 'red', 'green'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        // Shapes array to randomly select from
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
        
        // Open the edit modal for the new note
        selectedNoteId = newId;
        showModal = true;
    }
    
    function openDetailModal(event: CustomEvent) {
        selectedNoteId = event.detail.noteId;
        showDetailModal = true;
    }
    
    // Get pinned and unpinned notes
    $: pinnedNotes = $notes.filter(note => note.pinned);
    $: unpinnedNotes = $notes.filter(note => !note.pinned);
</script>

<style>
    /* Global page styling */
    :global(body) {
        margin: 0;
        padding: 0;
        background: #e9c6e5;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        overflow: hidden;
        height: 100vh;
    }
    
    .app-container {
        position: relative;
        width: 100vw;
        height: 100vh;
        overflow: hidden;
    }
    
    .pinned-notes-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        padding: 10px 0;
        z-index: 100;
        display: flex;
        justify-content: center;
        overflow-x: auto;
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .pinned-notes-wrapper {
        display: flex;
        flex-wrap: nowrap;
        align-items: center;
        padding: 0 20px;
    }
    
    .pinned-note-label {
        margin-right: 15px;
        font-size: 14px;
        opacity: 0.7;
        white-space: nowrap;
    }
    
    .create-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: white;
        color: black;
        font-size: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
        cursor: pointer;
        border: none;
        z-index: 100;
        transition: transform 0.3s, background 0.3s;
    }
    
    .create-button:hover {
        transform: scale(1.1);
        background: #f0f0f0;
    }
    
    .no-pinned-notes {
        font-style: italic;
        opacity: 0.5;
    }
</style>

<div class="app-container">
    <!-- Pinned notes section -->
    {#if pinnedNotes.length > 0}
        <div class="pinned-notes-container">
            <div class="pinned-notes-wrapper">
                <span class="pinned-note-label">Pinned:</span>
                {#each pinnedNotes as note (note.id)}
                    <Note note={note} isPinned={true} on:openDetail={openDetailModal} />
                {/each}
            </div>
        </div>
    {:else}
        <div class="no-pinned-notes">No pinned notes</div>
    {/if}
    
    <!-- Regular floating notes -->
    {#each unpinnedNotes as note (note.id)}
        <Note note={note} isPinned={false} on:openDetail={openDetailModal} />
    {/each}
    
    <!-- Create button -->
    <button class="create-button" on:click={createNote}>+</button>
    
    <!-- Modals -->
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