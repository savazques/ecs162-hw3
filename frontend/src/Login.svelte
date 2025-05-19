<script lang="ts">
  import { onMount } from "svelte";
  import { user } from "./stores/user";

  let loading = true;
  let error = "";
  let fetchedUser: any = {};
  let isAccountSidebarOpen = false;

  onMount(async () => {
    try {
      const response = await fetch("http://localhost:8000/", {
        credentials: "include",
      });
      console.log(response, "here is the response");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchedUser = await response.json();
      // console.log("username type:", user.type);
      // console.log("username email:", user.email);

      user.set({ email: fetchedUser.email, type: fetchedUser.type });

      //   if (!fetchedUser.email.match("Login with Dex")) {
      //     name = fetchedUser.email;
      //   }
      loading = false;
    } catch (error) {
      console.error("Failed to Check Login Status", error);
      error = error instanceof Error ? error.message : "Unknown error occurred";
      loading = false;
    }
  });

  function openSidebar() {
    isAccountSidebarOpen = true;
  }
  function closeSidebar() {
    isAccountSidebarOpen = false;
  }
</script>

<div class="top-right">
  {#if loading}
    <p>Loading...</p>
  {:else if error}
    <p>Error: {error}</p>
  {:else if fetchedUser.email}
    <button on:click={openSidebar} id="account-btn">
      <strong>Account</strong> &#9776;
    </button>
    {#if isAccountSidebarOpen}
      <div class="account-sidebar">
        <button class="close-button" on:click={closeSidebar}>×</button>
        <div class="account-content">
          <h2>Welcome</h2>
          <p class="user-email">{fetchedUser.email}</p>
        </div>
        <a href="http://localhost:8000/logout" class="logout-button">Log Out</a>
      </div>
    {/if}
  {:else}
    <a href="http://localhost:8000/login" id="login-button">LOG IN</a>
  {/if}
</div>

<style>
  #login-button {
    background: #5c849c;
    color: #fff;
    border: none;
    border-radius: 4px;
    text-align: center;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0.7rem 1.5rem;
    margin: 2rem;
    align-self: flex-end;
    font-family: "Helvetica Neue", Arial, Helvetica, sans-serif;
    line-height: 2;
  }

  #login-button:hover {
    background: #3a5a6c;
  }

  #account-btn {
    color: black;
    border: none;
    background-color: white;
    font-size: 1rem;
    cursor: pointer;
  }

  .account-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 320px;
    height: 100%;
    background: #fff;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    z-index: 1001;
    display: flex;
    flex-direction: column;
    animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes slideIn {
    from {
      right: -320px;
    }
    to {
      right: 0;
    }
  }

  .close-button {
    align-self: flex-end;
    font-size: 2rem;
    background: none;
    border: none;
    cursor: pointer;
    margin: 1rem;
  }

  .account-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    padding: 2rem;
  }

  .account-content h2 {
    margin-bottom: 0.5rem;
  }

  .user-email {
    font-weight: bold;
    font-size: 1.1rem;
    margin-top: 0;
  }

  .logout-button {
    margin: 2rem;
    padding: 0.4rem 1rem;
    background: #5c849c;
    color: #fff;
    border: none;
    border-radius: 3px;
    text-align: center;
    text-decoration: none;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    align-self: flex-end;
  }

  .logout-button:hover {
    background: #3a5a6c;
  }
</style>
