<script lang="ts">
  import { onMount } from "svelte";
  import Date from "./Date.svelte";
  import logo from "./assets/NewYorkTimes.svg.png";
  import "./app.css";
  import { stringify } from "postcss";

  interface Article {
    headline: { main: string };
    abstract: string;
    multimedia: {
      default: {
        url: string;
      };
    };
  }

  interface Comment {
    commentId: number;
    user:string; // will be updated to User Interface 
    userType: string;
    text: string;
    datePosted: number;
    deleted: boolean;
  }

  let comments: Comment[] = [];
  let commentID = 0;

  let articles: ArticalResponse | null = null;
  let topArticles: Article[] = [];
  // let totalcomments: Comment = ;
  let loading = true;
  let error = "";
  let isSidebarOpen = false;
  let selectedArticle: Article | null = null;

  interface ArticalResponse {
    response: {
      docs: Article[];
    };
  }

 
  async function loadComments () {
    try{
      const response = await fetch(`http://localhost:8000/fetchComments`)
      const fetchedComments = await response.json();
      comments = fetchedComments;
      //console.log(comments[0])

    } catch (error) {
      console.error("An Error Occured fetching comments")
    } 
  }

  async function deleteComment (id:number) {
    try {
      await fetch(`http://localhost:8000/deleteComment/${id}`, {
        method: 'DELETE'
      })
      loadComments();
      
    } catch (error) {
      console.error("Error Deleting Comment")
    }
  }

  function openSidebar(article: Article) {
    selectedArticle = article;
    isSidebarOpen = true;
    loadComments(); 
  }

  function closeSidebar() {
    isSidebarOpen = false;
    selectedArticle = null;
  }

  let inputValue = "";

  async function handleCommentSubmit() {
    console.log("clicked the comment submission");
    console.log(inputValue);

    try {
      await fetch("http://localhost:8000/addComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: commentID,
          user: "User sfsths",
          userType: "",
          text: inputValue,
          datePosted: "Today at this time",
          deleted: false,
        }),
      });
      commentID += 1; 
    } catch (error) {
      console.error("error submitting form", error);
    }

    inputValue = "";
    loadComments();
  }

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8000/getArticles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      articles = await response.json();

      if (articles?.response?.docs) {
        for (let i = 0; i < 6; i++) {
          topArticles.push(articles?.response.docs[i]);
        }
      }

      loading = false;

    } catch (error) {
      console.error("Failed to fetch articles:", error);
      error = error instanceof Error ? error.message : "Unknown error occurred";
      loading = false;
    }
  });
</script>

<header>
  <nav>
    <div class="date-container">
      <Date />
    </div>
    <div class="logo-container">
      <a href="https://www.nytimes.com/">
        <img src={logo} alt="NYTLogo" />
      </a>
    </div>
  </nav>
</header>

<main>
  {#if loading}
    <p>Loading articles...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if topArticles.length > 0}
    <div class="grid-container" data-testid="grid-container">
      <div class="article1">
        {#if topArticles[0]?.multimedia.default.url}
          <img src={topArticles[0]?.multimedia.default.url} alt="article1" />
        {/if}
        <h2>{topArticles[0]?.headline?.main || "Loading..."}</h2>
        <div class="read-text">6 min read</div>
        <div>
          <p>{topArticles[0]?.abstract || "No abstract available"}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[0])}
        >
          Add Comment
        </button>
      </div>

      <div class="article2">
        <div class="line"></div>
        {#if topArticles[1]?.multimedia.default.url}
          <img src={topArticles[1]?.multimedia.default.url} alt="article1" />
        {/if}
        <h1>{topArticles[1]?.headline?.main}</h1>
        <div class="read-text">5 min read</div>
        <div>
          <p>{topArticles[1]?.abstract}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[1])}
        >
          Add Comment
        </button>
      </div>

      <div class="article3">
        <div class="line"></div>
        {#if topArticles[2]?.multimedia.default.url}
          <img src={topArticles[2]?.multimedia.default.url} alt="article1" />
        {/if}
        <p class="articleTitle">{topArticles[2]?.headline?.main}</p>
        <div class="read-text">10 min read</div>
        <div>
          <p>{topArticles[2]?.abstract}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[2])}
        >
          Add Comment
        </button>
      </div>

      <div class="article4">
        <div class="line"></div>
        {#if topArticles[3]?.multimedia.default.url}
          <img src={topArticles[3]?.multimedia.default.url} alt="article1" />
        {/if}
        <p class="articleTitle">{topArticles[3]?.headline?.main}</p>
        <div class="read-text">8 min read</div>
        <div>
          <p>{topArticles[3]?.abstract}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[3])}
        >
          Add Comment
        </button>
      </div>

      <div class="article5">
        <div class="line"></div>
        {#if topArticles[4]?.multimedia.default.url}
          <img src={topArticles[4]?.multimedia.default.url} alt="article1" />
        {/if}
        <h3>{topArticles[4]?.headline?.main}</h3>
        <div class="read-text">4 min read</div>
        <div>
          <p>{topArticles[4]?.abstract}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[4])}
        >
          Add Comment
        </button>
      </div>

      <div class="article6">
        <div class="line"></div>
        {#if topArticles[5]?.multimedia.default.url}
          <img src={topArticles[5]?.multimedia.default.url} alt="article1" />
        {/if}
        <h2>{topArticles[5]?.headline?.main}</h2>
        <div class="read-text">2 min read</div>
        <div>
          <p>{topArticles[5]?.abstract}</p>
        </div>
        <button
          class="comment-button"
          on:click={() => openSidebar(topArticles[5])}
        >
          Add Comment
        </button>
      </div>
    </div>
  {:else}
    <p>No articles available</p>
  {/if}
</main>

{#if isSidebarOpen}
  <div class="sidebar-overlay"> </div>
  <div class="sidebar">
    <button class="close-button" on:click={closeSidebar}>×</button>
    <h3>Add Comment</h3>
    <div class="comment-form">
      <form on:submit|preventDefault={handleCommentSubmit}>
        <input name="Write Something" type="text" bind:value={inputValue} />
        <button class="submit-button" type="submit">Submit</button>
      </form>
    </div>
    <div class="comment-container">
      {#each comments as comment}
        {#if comment.deleted === false}
          <p> {comment.user}</p>
          <p> {comment.text}</p>
          <p> {comment.datePosted}</p>
          {#if comment.userType === "mod"}
            <button on:click={() => {console.log('comment to delete', comment.commentId); deleteComment(comment.commentId)}}> Delete Comment </button>
          {/if}
        {:else}
          <p> {comment.commentId} was deleted by MOD</p>  
        {/if}

       

      {/each}
     

    </div>
  </div>
{/if}
