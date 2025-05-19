<script lang="ts">
  import { onMount } from "svelte";
  import Date from "./Date.svelte";
  import logo from "./assets/NewYorkTimes.svg.png";
  import "./app.css";
  import Login from "./Login.svelte";
  import { user } from "./stores/user";
  import mockArticles from "./mockArticles.json";
  import CommentIcon from "./CommentIcon.svelte";

  interface Article {
    _id: string;
    headline: { main: string };
    abstract: string;
    multimedia: {
      default: {
        url: string;
      };
    };
    commentCount: number;
  }

  interface Comment {
    commentId: number;
    user: string;
    text: string;
    datePosted: number;
    deleted: boolean;
    articleID: string;
    parentId?: number; // for replies
    replies?: Comment[]; // for nested replies
  }

  let comments: Comment[] = [];

  let articles: ArticalResponse | null = null;
  let topArticles: Article[] = [];
  // let totalcomments: Comment = ;
  let loading = true;
  let error = "";
  let isSidebarOpen = false;
  let selectedArticle: Article | null = null;

  let replyingTo: number | null = null;
  let replyInputValue: string = "";

  interface ArticalResponse {
    response: {
      docs: Article[];
    };
  }

  async function loadComments(selectedArticle: string | null) {
    if (!selectedArticle) return;
    console.log("ATTEMPTING TO LOAD COMMENT", selectedArticle);
    try {
      const response = await fetch(
        `http://localhost:8000/fetchComments/${selectedArticle}`
      );
      const fetchedComments = await response.json();
      comments = fetchedComments;
      return comments;
    } catch (error) {
      console.error("An Error Occured fetching comments");
    }
  }

  async function deleteComment(id: number) {
    try {
      console.log("comment to delete", id);
      await fetch(`http://localhost:8000/deleteComment/${id}`, {
        method: "DELETE",
      });
      // Immediately update the UI by marking the comment as deleted
      const commentToDelete = comments.find((c) => c.commentId === id);
      if (commentToDelete) {
        commentToDelete.deleted = true;
      }
      if (selectedArticle) {
        loadComments(selectedArticle._id);
      }
    } catch (error) {
      console.error("Error Deleting Comment");
    }
  }

  function openSidebar(article: Article) {
    selectedArticle = article;
    isSidebarOpen = true;
    loadComments(selectedArticle._id);
    inputValue = "";
  }

  function closeSidebar() {
    isSidebarOpen = false;
    selectedArticle = null;
  }

  let inputValue = "";

  async function articleCommentCount(articleId: string) {
    // call fetch article, with given articlename
    // get the length of the response
    // set that to commentCount for each article
    let totalComments = await loadComments(articleId);
    if (totalComments) {
      return totalComments.length;
    }
    return 0;
  }

  function getTimeStamp() {
    const now = new window.Date();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const year = now.getFullYear();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return `${month}/${day}/${year}, ${hours}:${seconds}`;
  }

  async function handleCommentSubmit() {
    console.log("clicked the comment submission");
    const commentIdentification = new window.Date();
    try {
      await fetch("http://localhost:8000/addComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: commentIdentification.getTime(),
          user: $user?.email,
          text: inputValue,
          datePosted: getTimeStamp(),
          deleted: false,
          articleID: selectedArticle?._id,
        }),
      });

      // Update the comment count for the selected article
      if (selectedArticle) {
        selectedArticle.commentCount += 1;
        const index = topArticles.findIndex(
          (article) => article._id === selectedArticle!._id
        );
        if (index !== -1) {
          topArticles[index].commentCount = selectedArticle.commentCount;
        }
      }
    } catch (error) {
      console.error("error submitting form", error);
    }
    inputValue = "";
    if (selectedArticle?._id) {
      await articleCommentCount(selectedArticle._id);
    }
    loadComments(selectedArticle?._id ?? null);
  }

  async function handleReplySubmit(parentId: number) {
    const replyIdentification = new window.Date();
    try {
      await fetch("http://localhost:8000/addComment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId: replyIdentification.getTime(),
          user: $user?.email,
          text: replyInputValue,
          datePosted: getTimeStamp(),
          deleted: false,
          articleID: selectedArticle?._id,
          parentId: parentId,
        }),
      });
      console.log($user?.email, "this is the user");
      replyInputValue = "";
      replyingTo = null;
      console.log("SUBMITTING A COMMENT");
      if (selectedArticle?._id) {
        await articleCommentCount(selectedArticle._id);
      }
      loadComments(selectedArticle?._id ?? null);
    } catch (error) {
      console.error("error submitting reply", error);
    }
  }

  // FOR WHEN WE ARE USING THE API ENDPOING
  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8000/getArticles");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      articles = await response.json();

      if (articles?.response?.docs) {
        // Optionally, fetch comment counts for each article
        for (let i = 0; i < 6; i++) {
          articles.response.docs[i].commentCount = await articleCommentCount(
            articles?.response.docs[i]._id
          );
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

  // onMount(() => {
  //   articles = { response: { docs: mockArticles } };
  //   topArticles = mockArticles;
  //   loading = false;
  // });
</script>

<header>
  <nav>
    <div class="date-container">
      <Date />
    </div>
    <h1>Welcome to the News App</h1>
    <div class="logo-container">
      <a href="https://www.nytimes.com/">
        <img src={logo} alt="NYTLogo" />
      </a>
    </div>
    <div class="login-container">
      <Login />
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
          <img
            src={topArticles[0]?.multimedia.default.url}
            alt={topArticles[0]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[0]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[0].commentCount}</span>
          <CommentIcon />
        </button>
      </div>

      <div class="article2">
        <div class="line"></div>
        {#if topArticles[1]?.multimedia.default.url}
          <img
            src={topArticles[1]?.multimedia.default.url}
            alt={topArticles[1]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[1]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[1].commentCount}</span>
          <CommentIcon />
        </button>
      </div>

      <div class="article3">
        <div class="line"></div>
        {#if topArticles[2]?.multimedia.default.url}
          <img
            src={topArticles[2]?.multimedia.default.url}
            alt={topArticles[2]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[2]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[2].commentCount}</span>
          <CommentIcon />
        </button>
      </div>

      <div class="article4">
        <div class="line"></div>
        {#if topArticles[3]?.multimedia.default.url}
          <img
            src={topArticles[3]?.multimedia.default.url}
            alt={topArticles[3]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[3]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[3].commentCount}</span>
          <CommentIcon />
        </button>
      </div>

      <div class="article5">
        <div class="line"></div>
        {#if topArticles[4]?.multimedia.default.url}
          <img
            src={topArticles[4]?.multimedia.default.url}
            alt={topArticles[4]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[4]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[4].commentCount}</span>
          <CommentIcon />
        </button>
      </div>

      <div class="article6">
        <div class="line"></div>
        {#if topArticles[5]?.multimedia.default.url}
          <img
            src={topArticles[5]?.multimedia.default.url}
            alt={topArticles[5]?.headline?.main}
          />
        {:else}
          <div class="alt-text">{topArticles[5]?.headline?.main}</div>
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
          <span class="comment-count">{topArticles[5].commentCount}</span>
          <CommentIcon />
        </button>
      </div>
    </div>
  {:else}
    <p>No articles available</p>
  {/if}
</main>

{#if isSidebarOpen}
  <div class="sidebar-overlay"></div>
  <div class="sidebar">
    <button class="close-button" on:click={closeSidebar}>×</button>
    <h2>{selectedArticle?.headline.main}</h2>
    <div class="sidebar-title-line"></div>
    <h3 class="comment-heading">
      Comments <span class="comment-count"
        >{comments.filter((c) => c.articleID === selectedArticle?._id)
          .length}</span
      >
    </h3>
    {#if !$user}
      <p>Login to post a commment</p>
      <Login />
    {:else}
      <div class="comment-form">
        <!-- where we submit form -->
        <form on:submit|preventDefault={handleCommentSubmit}>
          <input
            name="Write Something"
            type="text"
            bind:value={inputValue}
            placeholder="Write your comment here..."
          />
          <!-- button to submit comment -->
          <button class="submit-button" type="submit">Submit</button>
        </form>
      </div>
    {/if}

    <div class="comment-container">
      {#each comments.filter((c) => c.parentId == null && c.articleID === selectedArticle?._id) as comment}
        <div class="comment">
          <p class="user">{comment.user}</p>
          {#if comment.deleted === false}
            <p>{comment.text}</p>
            <p class="date">{comment.datePosted}</p>
            {#if $user}
              <button
                class="reply-button"
                on:click={() => (replyingTo = comment.commentId)}
              >
                Reply
              </button>
            {/if}
            {#if $user && $user.type == "moderator"}
              <button on:click={() => deleteComment(comment.commentId)}>
                Delete Comment
              </button>
            {/if}
          {:else}
            <p>Comment was deleted by moderator</p>
          {/if}
          {#if $user && replyingTo === comment.commentId}
            <form
              class="reply-form"
              on:submit|preventDefault={() =>
                handleReplySubmit(comment.commentId)}
            >
              <input
                type="text"
                bind:value={replyInputValue}
                placeholder="Write your reply..."
              />
              <button type="submit" class="submit-button">Submit</button>
            </form>
          {/if}
          <div class="replies" style="margin-left: 2rem;">
            {#each comments.filter((r) => r.parentId === comment.commentId) as reply}
              <div class="comment">
                <p class="user">{reply.user}</p>
                {#if reply.deleted === false}
                  <p>{reply.text}</p>
                  <p class="date">{reply.datePosted}</p>
                  {#if $user}
                    <button
                      class="reply-button"
                      on:click={() => (replyingTo = reply.commentId)}
                    >
                      Reply
                    </button>
                  {/if}
                  {#if $user && $user.type === "moderator"}
                    <button on:click={() => deleteComment(reply.commentId)}>
                      Delete Comment
                    </button>
                  {/if}
                {:else}
                  <p>Comment was deleted by moderator</p>
                {/if}
                {#if $user && replyingTo === reply.commentId}
                  <form
                    class="reply-form"
                    on:submit|preventDefault={() =>
                      handleReplySubmit(reply.commentId)}
                  >
                    <input
                      type="text"
                      bind:value={replyInputValue}
                      placeholder="Write your reply..."
                    />
                    <button type="submit" class="submit-button">Submit</button>
                  </form>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}
