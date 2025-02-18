<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import { createEventDispatcher } from 'svelte';

    export let note = { id: 0, title: "Untitled", content: "", color: "blue", shape: "square", x: 100, y: 100, pinned: false };
    export let isPinned = false;
    const dispatch = createEventDispatcher();

    let baseX: number = browser ? (note.x / window.innerWidth) * 100 : 10;
    let baseY: number = browser ? (note.y / window.innerHeight) * 100 : 10;
    let targetX = baseX;
    let targetY = baseY;
    let isDragging: boolean = false;
    let wasDragged: boolean = false;
    let floatPhase = Math.random() * Math.PI * 2;
    const floatSpeed = 0.05;
    const floatDistance = 2;
    let dx = 0;
    let dy = 0;
    let animationId: number | undefined;
    let lastTouchX: number = 0;
    let lastTouchY: number = 0;
    let interactionType: 'mouse' | 'touch' | null = null;

    // Define the reserved space for pinned notes (in vh units)
    const PINNED_SECTION_HEIGHT = 15; // Adjust this value based on your pinned section height

    function updatePosition() {
        if (isPinned) return;
        
        baseX = Math.min(90, Math.max(5, baseX)); // Reduced left boundary to 5%
        
        // Ensure notes stay below the pinned section
        const minY = PINNED_SECTION_HEIGHT;
        baseY = Math.min(95, Math.max(minY, baseY));

        if (browser) {
            let existingNotes = JSON.parse(localStorage.getItem('notes') || '[]');
            const noteIndex = existingNotes.findIndex((n: any) => n.id === note.id);
            if (noteIndex >= 0) {
                existingNotes[noteIndex] = { ...existingNotes[noteIndex], baseX, baseY };
            } else {
                existingNotes.push({ id: note.id, title: note.title, baseX, baseY });
            }
            localStorage.setItem('notes', JSON.stringify(existingNotes));
        }
    }

    onMount(() => {
        if (browser && !isPinned) {
            let savedNotes = JSON.parse(localStorage.getItem('notes') || '[]');
            let currentNote = savedNotes.find((n: any) => n.id === note.id);
            if (currentNote) {
                baseX = currentNote.baseX;
                // Ensure loaded notes are also below pinned section
                baseY = Math.max(PINNED_SECTION_HEIGHT, currentNote.baseY);
                targetX = currentNote.baseX;
                targetY = baseY;
            } else {
                // For new notes, ensure they start below pinned section
                baseY = Math.max(PINNED_SECTION_HEIGHT, baseY);
                targetY = baseY;
            }

            function animate() {
                if (!isDragging && !isPinned) {
                    floatPhase += floatSpeed;
                    dx = Math.cos(floatPhase) * floatDistance;
                    dy = Math.sin(floatPhase) * floatDistance;
                } else {
                    dx = 0;
                    dy = 0;
                }

                if (!isPinned) {
                    baseX += (targetX - baseX) * 0.15;
                    baseY += (targetY - baseY) * 0.15;
                    updatePosition();
                }
                
                animationId = requestAnimationFrame(animate);
            }
            animationId = requestAnimationFrame(animate);

            window.addEventListener('resize', () => {
                if (isPinned) return;
                
                let newBaseX = (baseX / 100) * window.innerWidth;
                let newBaseY = (baseY / 100) * window.innerHeight;

                baseX = (newBaseX / window.innerWidth) * 100;
                baseY = Math.max(PINNED_SECTION_HEIGHT, (newBaseY / window.innerHeight) * 100);

                targetX = baseX;
                targetY = baseY;

                updatePosition();
            });
        }
    });

    onDestroy(() => {
        if (typeof animationId !== 'undefined') {
            cancelAnimationFrame(animationId);
        }
        // Clean up any remaining event listeners
        if (browser) {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", stopDrag);
            window.removeEventListener("touchmove", touchDrag, { passive: false } as EventListenerOptions);
            window.removeEventListener("touchend", stopTouchDrag);
            window.removeEventListener("touchcancel", stopTouchDrag);
        }
    });

    // Mouse event handlers
    function startDrag(event: MouseEvent) {
        if (isPinned) return;
        
        // Only handle mouse events if we're not already handling touch
        if (interactionType === 'touch') return;
        
        interactionType = 'mouse';
        isDragging = true;
        wasDragged = false;
        
        if (browser) {
            window.addEventListener("mousemove", drag);
            window.addEventListener("mouseup", stopDrag);
        }
    }

    function stopDrag() {
        if (interactionType !== 'mouse') return;
        
        isDragging = false;
        interactionType = null;
        
        if (browser) {
            window.removeEventListener("mousemove", drag);
            window.removeEventListener("mouseup", stopDrag);
        }
    }

    function drag(event: MouseEvent) {
        if (isDragging && browser && !isPinned && interactionType === 'mouse') {
            targetX += (event.movementX / window.innerWidth) * 100;
            targetY += (event.movementY / window.innerHeight) * 100;
            
            // Apply constraints
            targetX = Math.min(90, Math.max(5, targetX)); // Reduced left boundary to 5%
            targetY = Math.min(95, Math.max(PINNED_SECTION_HEIGHT, targetY));
            
            updatePosition();
            wasDragged = true;
        }
    }

    // Touch event handlers
    function startTouchDrag(event: TouchEvent) {
        if (isPinned) return;
        
        // Only handle touch events if we're not already handling mouse
        if (interactionType === 'mouse') return;
        
        interactionType = 'touch';
        isDragging = true;
        wasDragged = false;
        
        if (event.touches.length > 0) {
            lastTouchX = event.touches[0].clientX;
            lastTouchY = event.touches[0].clientY;
        }
        
        if (browser) {
            window.addEventListener("touchmove", touchDrag, { passive: false });
            window.addEventListener("touchend", stopTouchDrag);
            window.addEventListener("touchcancel", stopTouchDrag);
        }
    }

    function stopTouchDrag() {
        if (interactionType !== 'touch') return;
        
        isDragging = false;
        interactionType = null;
        
        if (browser) {
            window.removeEventListener("touchmove", touchDrag);
            window.removeEventListener("touchend", stopTouchDrag);
            window.removeEventListener("touchcancel", stopTouchDrag);
        }
    }

    function touchDrag(event: TouchEvent) {
        if (isDragging && browser && !isPinned && interactionType === 'touch' && event.touches.length > 0) {
            // Only prevent default on touch events we're handling
            event.preventDefault();
            
            const touch = event.touches[0];
            const movementX = touch.clientX - lastTouchX;
            const movementY = touch.clientY - lastTouchY;
            
            targetX += (movementX / window.innerWidth) * 100;
            targetY += (movementY / window.innerHeight) * 100;
            
            // Apply constraints
            targetX = Math.min(90, Math.max(5, targetX));
            targetY = Math.min(95, Math.max(PINNED_SECTION_HEIGHT, targetY));
            
            // Update for next touchmove event
            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;
            
            updatePosition();
            wasDragged = true;
        }
    }

    function openNote(event: Event) {
        if (!wasDragged) {
            dispatch('openDetail', { noteId: note.id });
        }
    }

    function handleKey(event: KeyboardEvent) {
        if (event.key === "Enter" || event.key === " ") {
            openNote(event);
        }
    }
</script>

<style>
    .note-container {
        position: absolute;
        left: 0;
        top: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        pointer-events: none;
        transition: transform 0.2s ease-out;
    }
    
    .pinned-note {
        position: relative;
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        margin: 0 10px;
        pointer-events: auto;
    }

    .note-btn {
        width: clamp(50px, 8vw, 80px);
        height: clamp(50px, 8vw, 80px);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: clamp(12px, 1vw, 14px);
        font-weight: bold;
        border-radius: 10px;
        cursor: grab;
        user-select: none;
        transition: transform 0.3s ease-out;
        will-change: transform;
        pointer-events: auto;
        border: none;
        touch-action: none; /* Prevents browser handling of touch interactions */
    }

    .pinned-btn {
        width: clamp(40px, 6vw, 60px);
        height: clamp(40px, 6vw, 60px);
        cursor: pointer;
    }

    .note-btn:not(.pinned-btn):active {
        cursor: grabbing;
        transition: none;
    }

    .note-title {
        margin-top: 8px;
        padding: 6px 12px;
        font-size: clamp(12px, 1vw, 14px);
        font-weight: bold;
        color: white;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 15px;
        white-space: nowrap;
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        pointer-events: auto;
        text-align: center;
        transition: 0.3s ease;
    }

    .pinned-title {
        margin-top: 4px;
        max-width: 80px;
        font-size: clamp(10px, 0.8vw, 12px);
    }

    .note-title:hover {
        max-width: 300px;
        white-space: normal;
        text-overflow: clip;
        background: rgba(0, 0, 0, 0.9);
    }
</style>

{#if isPinned}
    <div class="pinned-note">
        <button 
            class="note-btn pinned-btn"
            on:click={openNote}
            on:keydown={handleKey}
            aria-label="Open pinned note: {note.title}"
            style="background-color:{note.color}; border-radius: {note.shape === 'circle' ? '50%' : '10px'};">
        </button>
        <div class="note-title pinned-title">{note.title}</div>
    </div>
{:else}
    <div
        class="note-container"
        style="left: {baseX}vw; top: {baseY}vh; transform: translate({dx}px, {dy}px);">
        
        <button 
            class="note-btn"
            on:mousedown={startDrag}
            on:touchstart={startTouchDrag}
            on:click={openNote}
            on:keydown={handleKey}
            aria-label="Open note: {note.title}"
            style="background-color:{note.color}; border-radius: {note.shape === 'circle' ? '50%' : '10px'};">
        </button>

        <div class="note-title">{note.title}</div>
    </div>
{/if}