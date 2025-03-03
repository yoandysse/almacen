<template>
  <v-navigation-drawer permanent>
    <v-list-item
      prepend-avatar="https://cdn-icons-png.flaticon.com/512/2203/2203183.png"
      title="Food Inventory"
      subtitle="Management System"
    ></v-list-item>

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item to="/" prepend-icon="mdi-view-dashboard" title="Dashboard"></v-list-item>
      <v-list-item to="/products" prepend-icon="mdi-food-apple" title="Products"></v-list-item>
      <v-list-item to="/inventory" prepend-icon="mdi-package-variant-closed" title="Inventory Movements"></v-list-item>
      <v-list-item to="/reports" prepend-icon="mdi-chart-bar" title="Reports"></v-list-item>
      <v-list-item to="/settings" prepend-icon="mdi-cog" title="Settings"></v-list-item>
    </v-list>
    
    <template v-slot:append>
      <div class="pa-2">
        <v-btn block color="primary">
          <v-icon start>mdi-export</v-icon>
          Export Data
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>