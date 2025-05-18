<script type="ts">
  import { onMount } from "svelte";

  let loading = true;
  let name = "";
  let error = "";
  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8000/", {
        credentials: "include",
      });
      console.log(response.headers, 'here is the response')

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      let res = await response.text();
      console.log("Response:", res);

      if (!res.match("Login with Dex")) {
        name = res;
      }
      loading = false;
    } catch (error) {
      console.error("Failed to Check Login Status", error);
      error = error instanceof Error ? error.message : "Unknown error occurred";
      loading = false;
    }
  });

  function dropdownMenu() {
    let content = document.getElementById("dropdown-content");
    let account = document.getElementById("dropbtn");
    if (content.style.visibility == "hidden") {
      content.style.visibility = "visible";
      account.innerHTML = "<strong>Account</strong>  &#9652";
    } else {
      content.style.visibility = "hidden";
      account.innerHTML = "<strong>Account</strong>  &#9662";
    }
  }
</script>

<div class="top-right">
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if name != ""}
    <button on:click={dropdownMenu} id="dropbtn"
      ><strong>Account</strong> &#9662</button
    >
    <div id="dropdown-content">
      <p>{name}</p>
      <a href="http://localhost:8000/logout" id="logout-button">Log Out</a>
    </div>
  {:else}
    <a href="http://localhost:8000/login" id="login-button">LOG IN</a>
  {/if}
</div>

<style>
  #login-button {
    color: white;
    background-color: #5c849c;
    font-size: 0.8rem;
    text-decoration: none;
    font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
    line-height: 2;
    padding-left: 10px;
    padding-right: 10px;
  }

  #dropbtn {
    color: black;
    border: none;
    background-color: white;
    font-size: 1rem;
  }

  #dropdown-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    visibility: hidden;
  }

  .top-right {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  #logout-button {
    text-decoration: none;
    color: black;
    font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
    text-align: center;
  }

  #logout-button:hover {
    text-decoration: underline;
  }
</style>
